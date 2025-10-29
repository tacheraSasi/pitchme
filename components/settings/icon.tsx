import React from 'react'
import { ThemedView } from '@/components/themed-view'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

export default function SettingsIcon() {
  return (
    <ThemedView>
        <MaterialIcons name="settings-accessibility" size={26}/>
    </ThemedView>
  )
}