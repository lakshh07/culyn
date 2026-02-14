import { auth } from '@/lib/auth'
import { streamText, type ChatMessage as LLMMessage } from '@/lib/llm'
import db from '@/lib/prisma'
import {
  CreateChatRequestSchema,
  ListConversationsQuerySchema,
  SendMessageRequestSchema,
} from '@culyn/shared/schemas'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const chat = new Hono()

/**
 * Build system context based on conversation type
 */
async function buildSystemContext(conversation: {
  contextType: string
  recipeId: string | null
  placeId: string | null
  productId: string | null
}): Promise<string> {
  let systemPrompt =
    'You are Culyn, a helpful AI assistant. You help users with recipes, places to eat, and product recommendations. Be friendly, concise, and helpful.'

  if (conversation.contextType === 'RECIPE' && conversation.recipeId) {
    const recipe = await db.recipe.findUnique({
      where: { id: conversation.recipeId },
      select: {
        title: true,
        description: true,
        cookTime: true,
        servings: true,
        difficulty: true,
        calories: true,
        cookingSteps: true,
        ingredients: true,
        notes: true,
      },
    })
    if (recipe) {
      systemPrompt += `\n\nYou are helping the user with a specific recipe:\n- Title: ${recipe.title}\n- Description: ${recipe.description}\n- Cook Time: ${recipe.cookTime} minutes\n- Servings: ${recipe.servings}\n- Difficulty: ${recipe.difficulty}\n- Calories: ${recipe.calories}\n- Steps: ${JSON.stringify(recipe.cookingSteps)}\n- Ingredients: ${JSON.stringify(recipe.ingredients)}\n${recipe.notes ? `- Notes: ${recipe.notes}` : ''}\n\nAnswer questions about this recipe, suggest modifications, and help with cooking tips.`
    }
  }

  if (conversation.contextType === 'PLACE' && conversation.placeId) {
    const place = await db.place.findUnique({
      where: { id: conversation.placeId },
      select: {
        name: true,
        description: true,
        type: true,
        address: true,
        city: true,
        cuisine: true,
        priceRange: true,
        rating: true,
        hours: true,
        notes: true,
      },
    })
    if (place) {
      systemPrompt += `\n\nYou are helping the user with a specific place:\n- Name: ${place.name}\n- Type: ${place.type}\n- Description: ${place.description}\n- Address: ${place.address}, ${place.city}\n- Cuisine: ${place.cuisine}\n- Price Range: ${place.priceRange}\n- Rating: ${place.rating}\n${place.notes ? `- Notes: ${place.notes}` : ''}\n\nAnswer questions about this place, suggest what to order, and provide helpful tips.`
    }
  }

  if (conversation.contextType === 'PRODUCT' && conversation.productId) {
    const product = await db.product.findUnique({
      where: { id: conversation.productId },
      select: {
        name: true,
        description: true,
        category: true,
        brand: true,
        price: true,
        features: true,
        specifications: true,
        notes: true,
      },
    })
    if (product) {
      systemPrompt += `\n\nYou are helping the user with a specific product:\n- Name: ${product.name}\n- Brand: ${product.brand}\n- Category: ${product.category}\n- Price: ${product.price}\n- Description: ${product.description}\n- Features: ${JSON.stringify(product.features)}\n- Specifications: ${JSON.stringify(product.specifications)}\n${product.notes ? `- Notes: ${product.notes}` : ''}\n\nAnswer questions about this product, compare with alternatives, and help with purchase decisions.`
    }
  }

  return systemPrompt
}

// POST /chat/conversations - Create a new conversation
chat.post('/conversations', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const payload = await CreateChatRequestSchema.parseAsync(await c.req.json())

  const conversation = await db.chatConversation.create({
    data: {
      userId: session.user.id,
      title: payload.title || 'New Chat',
      contextType: payload.contextType || 'GENERAL',
      recipeId: payload.recipeId || null,
      placeId: payload.placeId || null,
      productId: payload.productId || null,
    },
  })

  return c.json(conversation, 201)
})

// GET /chat/conversations - List conversations
chat.get('/conversations', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const queries = c.req.queries() || {}
  const queryParams = Object.fromEntries(
    Object.entries(queries).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  )

  const filters = await ListConversationsQuerySchema.parseAsync(queryParams)

  const conversations = await db.chatConversation.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      ...(filters.contextType && { contextType: filters.contextType }),
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          content: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: filters.limit,
    skip: filters.offset,
  })

  return c.json(conversations)
})

// GET /chat/conversations/:id - Get conversation with messages
chat.get('/conversations/:id', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { id } = c.req.param()

  const conversation = await db.chatConversation.findUnique({
    where: {
      id,
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) {
    throw new HTTPException(404, { message: 'Conversation not found' })
  }

  return c.json(conversation)
})

// POST /chat/conversations/:id/messages - Send message and stream AI response
chat.post('/conversations/:id/messages', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { id } = c.req.param()

  const conversation = await db.chatConversation.findUnique({
    where: {
      id,
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) {
    throw new HTTPException(404, { message: 'Conversation not found' })
  }

  const payload = await SendMessageRequestSchema.parseAsync(await c.req.json())

  // Save user message
  const userMessage = await db.chatMessage.create({
    data: {
      conversationId: id,
      role: 'USER',
      content: payload.content,
    },
  })

  // Build system context
  const systemPrompt = await buildSystemContext(conversation)

  // Build message history for LLM
  const llmMessages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversation.messages.map(msg => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    { role: 'user' as const, content: payload.content },
  ]

  // Stream response using NDJSON
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let fullContent = ''

      try {
        for await (const chunk of streamText(llmMessages)) {
          if (chunk.type === 'token' && chunk.content) {
            fullContent += chunk.content
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: 'token', content: chunk.content }) + '\n'
              )
            )
          }
        }

        // Save assistant message
        const assistantMessage = await db.chatMessage.create({
          data: {
            conversationId: id,
            role: 'ASSISTANT',
            content: fullContent,
            model: 'gpt-4o-mini',
          },
        })

        // Update conversation title if first message
        if (conversation.messages.length === 0) {
          const title =
            payload.content.length > 50
              ? payload.content.substring(0, 50) + '...'
              : payload.content
          await db.chatConversation.update({
            where: { id },
            data: { title },
          })
        }

        // Track AI usage
        await db.aiUsage.create({
          data: {
            feature: 'chat',
            initiator: 'user',
            provider: 'openai',
            model: 'gpt-4o-mini',
            userId: session.user.id,
          },
        })

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'done',
              messageId: assistantMessage.id,
              content: fullContent,
            }) + '\n'
          )
        )
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: 'error', error: error.message || 'An error occurred' }) + '\n'
          )
        )
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

// DELETE /chat/conversations/:id - Delete conversation
chat.delete('/conversations/:id', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { id } = c.req.param()

  const conversation = await db.chatConversation.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!conversation) {
    throw new HTTPException(404, { message: 'Conversation not found' })
  }

  await db.chatConversation.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return c.body(null, 204)
})

export default chat
