import { useThemeColors } from '@/constants/useTheme'
import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface TagInputProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function TagInput({ values, onChange, placeholder = 'Add...' }: TagInputProps) {
  const colors = useThemeColors()
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInputValue('')
  }

  const handleRemove = (tag: string) => {
    onChange(values.filter(v => v !== tag))
  }

  return (
    <View>
      <View
        style={[
          styles.inputRow,
          { borderColor: colors.border, backgroundColor: colors.background },
        ]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, fontFamily: 'Poppins_400Regular' }]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAdd}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.addButtonText,
              { color: colors.white, fontFamily: 'Poppins_500Medium' },
            ]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
      {values.length > 0 && (
        <View style={styles.tagsContainer}>
          {values.map(tag => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}>
              <Text
                style={[
                  styles.tagText,
                  { color: colors.textPrimary, fontFamily: 'Poppins_400Regular' },
                ]}>
                {tag}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(tag)}
                activeOpacity={0.7}
                style={styles.removeButton}>
                <Text style={[styles.removeText, { color: colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tagText: {
    fontSize: 14,
    lineHeight: 20,
  },
  removeButton: {
    marginLeft: 6,
    paddingHorizontal: 2,
  },
  removeText: {
    fontSize: 18,
    lineHeight: 20,
  },
})
