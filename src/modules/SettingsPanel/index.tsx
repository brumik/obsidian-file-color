import { Button } from 'components/Button'
import { AddCircleIcon } from 'components/icons/AddCircleIcon'
import { TrashIcon } from 'components/icons/TrashIcon'
import { usePlugin } from 'hooks/usePlugin'
import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import type { FileColorPluginSettings } from 'settings'
import {
  SettingItem,
  SettingItemControl,
  SettingItemInfo,
} from 'components/SettingItem'
import { SettingItemControlFull } from './SettingItemControlFull'
import { WideTextInput } from './WideTextInput'

type Color = FileColorPluginSettings['palette'][number]

export const SettingsPanel = () => {
  const plugin = usePlugin()
  const [palette, setPalette] = useState<FileColorPluginSettings['palette']>(
    plugin.settings.palette
  )
  const [changed, setChanged] = useState<boolean>(false)

  useEffect(() => {
    if (palette.length !== plugin.settings.palette.length) {
      setChanged(true)
      return
    }

    setChanged(
      palette.some((color) => {
        const settingsColor = plugin.settings.palette.find(
          (settingsColor) => settingsColor.id === color.id
        )

        if (
          !settingsColor ||
          settingsColor.name !== color.name ||
          settingsColor.value !== color.value
        ) {
          return true
        }
      })
    )
  }, [plugin, palette])

  const onRemoveColor = (color: Color, colorIndex: number) => {
    setPalette(palette.filter((paletteColor) => paletteColor.id !== color.id))
  }

  const onColorValueChange = (color: Color, value: string) => {
    setPalette(
      palette.map((paletteColor) => {
        if (paletteColor.id === color.id) {
          return { ...color, value }
        }
        return paletteColor
      })
    )
  }

  const onColorNameChange = (color: Color, name: string) => {
    setPalette(
      palette.map((paletteColor) => {
        if (paletteColor.id === color.id) {
          return { ...color, name }
        }
        return paletteColor
      })
    )
  }

  const onAddColor = () => {
    setPalette([
      ...palette,
      {
        id: nanoid(),
        name: '',
        value: '#ffffff',
      },
    ])
  }

  const onSave = () => {
    plugin.settings.palette = palette
    plugin.settings.fileColors = plugin.settings.fileColors.filter(
      (fileColor) => palette.find((color) => fileColor.color === color.id)
    )
    plugin.saveSettings()
    plugin.generateColorStyles()
    plugin.applyColorStyles()
    setChanged(false)
  }

  const onRevert = () => {
    setPalette(plugin.settings.palette)
    setChanged(false)
  }

  return (
    <div className="file-color-settings-panel">
      <h2>Palette</h2>
      {palette.length < 1 && <span>No colors in the palette</span>}
      {palette.map((color, colorIndex) => (
        <SettingItem key={color.id}>
          <SettingItemControlFull>
            <input
              type="color"
              value={color.value}
              onChange={(e) => onColorValueChange(color, e.target.value)}
            />
            <WideTextInput
              type="text"
              placeholder="Color name"
              value={color.name}
              onChange={(e) => onColorNameChange(color, e.target.value)}
            />
            <Button onClick={() => onRemoveColor(color, colorIndex)}>
              <TrashIcon />
            </Button>
          </SettingItemControlFull>
        </SettingItem>
      ))}
      <SettingItem>
        <SettingItemControlFull>
          <Button onClick={onAddColor}>
            <AddCircleIcon />
            <span>Add Color</span>
          </Button>
        </SettingItemControlFull>
      </SettingItem>
      {changed && (
        <SettingItem className="file-color-settings-save">
          <SettingItemInfo>
            <span className="mod-warning">You have unsaved changes.</span>
          </SettingItemInfo>
          <SettingItemControl>
            <Button onClick={onRevert}>Revert changes</Button>
            <Button onClick={onSave}>Save</Button>
          </SettingItemControl>
        </SettingItem>
      )}
    </div>
  )
}
