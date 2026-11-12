// Writes Tarnish's src/Media.xaml: original glyphs in the manner of the Elden Ring menu icons (engraved silhouettes,
// lozenges, tapered blades and concave arrowheads instead of plain bars and triangles), drawn on a 16x16 canvas;
// EmptyGameIcon on 64x64. Nothing is traced from the game.
// Playnite's own menu icon keys (AddGameIcon, ...) are not overridden: Playnite's glyphs, recolored by the palette.
// Usage: node src/themes/Tarnish/art/icons.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'Media.xaml');

const icons = {
  // ring and tapered handle
  IconSearch: 'F0M6.5,1A5.5,5.5 0 1 1 6.5,12A5.5,5.5 0 1 1 6.5,1ZM6.5,2.5A4,4 0 1 0 6.5,10.5A4,4 0 1 0 6.5,2.5ZM10,10.9L10.9,10L15.6,14.2L14.2,15.6Z',
  // four blades meeting at the centre
  IconClear: 'F1M8,6.8L2,1.2L1.2,2L6.8,8L1.2,14L2,14.8L8,9.2L14,14.8L14.8,14L9.2,8L14.8,2L14,1.2Z',
  // three rules with lozenge knobs
  IconViewSettings: 'F1M0,2.9H16V4.1H0ZM0,7.4H16V8.6H0ZM0,11.9H16V13.1H0ZM5,1L7.5,3.5L5,6L2.5,3.5ZM11,5.5L13.5,8L11,10.5L8.5,8ZM6,10L8.5,12.5L6,15L3.5,12.5Z',
  IconFilterPresets: 'F1M0,2H10V3.3H0ZM0,6.4H7V7.7H0ZM0,10.8H7V12.1H0ZM10,5H15.5V16L12.75,13.4L10,16Z',
  // two linked lozenges
  IconGroup: 'F0M5.5,2L11,8L5.5,14L0,8ZM5.5,4.1L2,8L5.5,11.9L9,8ZM10.5,2L16,8L10.5,14L8.9,12.2L12.7,8L8.9,3.8Z',
  // three blades of falling length
  IconSort: 'F1M0,3L8,1.9L16,3L8,4.1ZM0,8L5.5,6.9L11,8L5.5,9.1ZM0,13L3,11.9L6,13L3,14.1Z',
  IconDetailsView: 'F0M0,1H5.5V2.3H0ZM0,5.2H5.5V6.5H0ZM0,9.4H5.5V10.7H0ZM0,13.6H5.5V14.9H0ZM7.5,1H16V15H7.5ZM8.8,2.3V13.7H14.7V2.3Z',
  // four inventory slots
  IconGridView: 'F0M0,0H7V7H0ZM1.3,1.3V5.7H5.7V1.3ZM9,0H16V7H9ZM10.3,1.3V5.7H14.7V1.3ZM0,9H7V16H0ZM1.3,10.3V14.7H5.7V10.3ZM9,9H16V16H9ZM10.3,10.3V14.7H14.7V10.3Z',
  IconListView: 'F1M1.6,0.6L3.2,2.2L1.6,3.8L0,2.2ZM5,1.6H16V2.9H5ZM1.6,6.4L3.2,8L1.6,9.6L0,8ZM5,7.35H16V8.65H5ZM1.6,12.2L3.2,13.8L1.6,15.4L0,13.8ZM5,13.1H16V14.4H5Z',
  IconUpdate: 'F1M8,0L13,6H9L8.6,12H7.4L7,6H3ZM1,14.2L8,13.4L15,14.2L8,15Z',
  IconExplorer: 'F0M0,2.5H6L7.6,4.5H16V14.5H0ZM1.3,5.8V13.2H14.7V5.8Z',
  // a lozenge die
  IconRandom: 'F0M8,0L16,8L8,16L0,8ZM8,1.9L1.9,8L8,14.1L14.1,8ZM8,4.4L9.2,5.6L8,6.8L6.8,5.6ZM8,9.2L9.2,10.4L8,11.6L6.8,10.4ZM5.6,6.8L6.8,8L5.6,9.2L4.4,8ZM10.4,6.8L11.6,8L10.4,9.2L9.2,8Z',
  IconViewRandom: 'F1M0,4H4.5L10.5,12H13V10.2L16,12.7L13,15.2V13.4H9.8L3.8,5.4H0ZM0,12H3.6L5.2,9.9L6.1,11.1L4.3,13.4H0ZM10.5,4H13V2.2L16,4.7L13,7.2V5.4H11.2L9.9,7.1L9,5.9Z',
  // a chalice-like funnel
  IconFilter: 'F1M1,1.5H15L9.5,8.2V13.6L6.5,15.2V8.2Z',
  IconNotifications: 'F1M8,0.5C8.8,0.5 9.3,1 9.3,1.8C11.6,2.5 12.6,4.4 12.6,7C12.6,9.6 13.4,11 15,12.2V13H1V12.2C2.6,11 3.4,9.6 3.4,7C3.4,4.4 4.4,2.5 6.7,1.8C6.7,1 7.2,0.5 8,0.5ZM6.2,14H9.8C9.6,15.2 8.9,15.8 8,15.8C7.1,15.8 6.4,15.2 6.2,14Z',
  IconMainMenu: 'F1M0,3L8,1.9L16,3L8,4.1ZM0,8L8,6.9L16,8L8,9.1ZM0,13L8,11.9L16,13L8,14.1Z',
  // an open book
  IconLibrary: 'F0M8,3C6,1.6 3,1.4 0,2V13.5C3,12.9 6,13.1 8,14.5C10,13.1 13,12.9 16,13.5V2C13,1.4 10,1.6 8,3ZM7.3,4.2V12.6C5.6,11.8 3.4,11.6 1.4,11.9V3.2C3.6,2.9 5.8,3.2 7.3,4.2ZM8.7,4.2C10.2,3.2 12.4,2.9 14.6,3.2V11.9C12.6,11.6 10.4,11.8 8.7,12.6Z',
  IconStatistics: 'F1M1,9H4V14.2H1ZM6.5,5H9.5V14.2H6.5ZM12,1H15V14.2H12ZM0,15.6L8,15L16,15.6L8,16.2Z',
  IconWindowMinimize: 'F1M2,11.5L8,10.7L14,11.5L8,12.3Z',
  IconWindowMaximize: 'F0M2.5,2.5H13.5V13.5H2.5ZM3.7,3.7V12.3H12.3V3.7Z',
  IconWindowRestore: 'F0M5,2H14V11H12.4V3.2H5ZM2,5H11V14H2ZM3.2,6.2V12.8H9.8V6.2Z',
  IconWindowClose: 'F1M8,7L2.8,2L2,2.8L7,8L2,13.2L2.8,14L8,9L13.2,14L14,13.2L9,8L14,2.8L13.2,2Z',
  // concave arrowheads, the left and right arrows of the option rows
  IconDropDown: 'F1M2.5,5L8,8.6L13.5,5L8,12Z',
  IconSubmenu: 'F1M5,2.5L8.6,8L5,13.5L12,8Z',
  IconCheck: 'F1M1.5,8.6L3,7.6C4.2,8.6 5.2,9.8 6,11.2C8,7.4 10.8,4.2 14.5,2L15,2.8C11.6,5.6 8.8,9.4 6.6,14H5.6C4.6,11.8 3.2,10 1.5,8.6Z',
  // a four-point glint
  IconAdd: 'F1M8,0L9,7L16,8L9,9L8,16L7,9L0,8L7,7Z',
  // a quill
  IconEdit: 'F1M15.5,0.5C10,1.5 6,5 3.6,10L2,14L6,12.4C11,10 14.5,6 15.5,0.5ZM1.2,14.2L0.5,15.5L1.8,14.8Z',
  IconRemove: 'F1M5.5,0.5H10.5V2H15V3.3H1V2H5.5ZM2.8,4.8H13.2L12.2,15.5H3.8Z',
  IconOptions: 'F1M2.2,5.8L4.4,8L2.2,10.2L0,8ZM8,5.8L10.2,8L8,10.2L5.8,8ZM13.8,5.8L16,8L13.8,10.2L11.6,8Z',
  IconPlay: 'F1M3.5,1L14.5,8L3.5,15L6,8Z',
  IconInfo: 'F1M8,0.5L9.7,2.2L8,3.9L6.3,2.2ZM5,6H9.2V13.6L11,14.4V15.5H5V14.4L6.8,13.6V7.6L5,7Z',
  IconDownload: 'F1M8,12L13,6H9L8.6,0H7.4L7,6H3ZM1,14.5L8,13.7L15,14.5L8,15.3Z',
};

// A guiding light: a tall four-point glint standing over a thin ring of light on the ground (64x64 canvas).
const empty = 'F0M32,2L34.2,25.8L52,28L34.2,30.2L32,50L29.8,30.2L12,28L29.8,25.8Z'
  + 'M8,54A24,5 0 1 1 56,54A24,5 0 1 1 8,54ZM10.5,54A21.5,3.6 0 1 0 53.5,54A21.5,3.6 0 1 0 10.5,54Z';

const geo = Object.entries(icons).map(([k, v]) => `    <Geometry x:Key="${k}">${v}</Geometry>`).join('\n');

const xaml = `<!--
    Tarnish: icons. Generated by art/icons.mjs; edit the generator, not this file.
    Icon* are original engraved-style glyphs on a 16x16 canvas, drawn by IconTemplate in the inherited foreground.
    Playnite's menu icon keys stay Playnite's own glyphs, recolored by the palette.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib">
${geo}
    <Geometry x:Key="EmptyGameIcon">${empty}</Geometry>
    <DataTemplate x:Key="IconTemplate">
        <Viewbox Width="{DynamicResource IconSize}" Height="{DynamicResource IconSize}">
            <Canvas Width="16" Height="16">
                <Path Data="{Binding}" Fill="{Binding Foreground, RelativeSource={RelativeSource AncestorType=ContentControl}}" />
            </Canvas>
        </Viewbox>
    </DataTemplate>
    <DataTemplate x:Key="IconSmallTemplate">
        <Viewbox Width="12" Height="12">
            <Canvas Width="16" Height="16">
                <Path Data="{Binding}" Fill="{Binding Foreground, RelativeSource={RelativeSource AncestorType=ContentControl}}" />
            </Canvas>
        </Viewbox>
    </DataTemplate>
    <DataTemplate x:Key="ClearTextIconTemplate">
        <ContentControl Content="{DynamicResource IconClear}" ContentTemplate="{DynamicResource IconSmallTemplate}" />
    </DataTemplate>
    <DataTemplate x:Key="SearchTextIconTemplate">
        <ContentControl Content="{DynamicResource IconSearch}" ContentTemplate="{DynamicResource IconTemplate}" />
    </DataTemplate>
</ResourceDictionary>
`;
writeFileSync(out, xaml, 'utf8');
console.log('wrote', out);
