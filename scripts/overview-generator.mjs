// Shared fragments and helpers for theme game-page overview generators.
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyGamePageBreakpoints } from './game-page-breakpoints.mjs';

const STEAM_PLUGIN_ID = 'cb91dfc9-b977-43bf-8e70-55f46e410fab';

const PLURAL_LOC_OVERRIDES = {
  LOCDeveloperLabel: 'LOCDevelopersLabel',
  LOCPublisherLabel: 'LOCPublishersLabel',
  LOCPlatformTitle: 'LOCPlatformsTitle',
  LOCGenreLabel: 'LOCGenresLabel',
  LOCGameCategoriesTitle: 'LOCCategoriesLabel',
};

// Shared 6-group, 22-field metadata model (src/themes/AGENTS.md -> Metadata pane).
export const META_GROUPS = [
  ['MetaProgress', [
    ['CompletionStatus', 'LOCCompletionStatus', 'button', 'PART_ButtonCompletionStatus'],
    ['PlayTime', 'LOCTimePlayed', 'text', 'PART_TextPlayTime'],
    ['LastPlayed', 'LOCLastPlayed', 'text', 'PART_TextLastActivity'],
    ['RecentActivity', 'LOCRecentActivityLabel', 'text', 'PART_TextRecentActivity'],
    ['Added', 'LOCDateAddedLabel', 'text', 'PART_TextAdded'],
  ]],
  ['MetaScores', [
    ['CommunityScore', 'LOCCommunityScore', 'score', 'PART_TextCommunityScore'],
    ['CriticScore', 'LOCCriticScore', 'score', 'PART_TextCriticScore'],
    ['UserScore', 'LOCUserScore', 'score', 'PART_TextUserScore'],
  ]],
  ['MetaAbout', [
    ['Developers', 'LOCDeveloperLabel', 'items', 'PART_ItemsDevelopers'],
    ['Publishers', 'LOCPublisherLabel', 'items', 'PART_ItemsPublishers'],
    ['ReleaseDate', 'LOCGameReleaseDateTitle', 'button', 'PART_ButtonReleaseDate'],
    ['Series', 'LOCSeriesLabel', 'items', 'PART_ItemsSeries'],
    ['AgeRating', 'LOCAgeRatingLabel', 'items', 'PART_ItemsAgeRatings'],
    ['Region', 'LOCRegionLabel', 'items', 'PART_ItemsRegions'],
  ]],
  ['MetaTags', [
    ['Platform', 'LOCPlatformTitle', 'chips', 'PART_ItemsPlatforms'],
    ['Genres', 'LOCGenreLabel', 'chips', 'PART_ItemsGenres'],
    ['Categories', 'LOCGameCategoriesTitle', 'chips', 'PART_ItemsCategories'],
    ['Features', 'LOCFeaturesLabel', 'chips', 'PART_ItemsFeatures'],
    ['Tags', 'LOCTagsLabel', 'chips', 'PART_ItemsTags'],
  ]],
  ['MetaLibrary', [
    ['Library', 'LOCGameProviderTitle', 'button', 'PART_ButtonLibrary'],
    ['Source', 'LOCSourceLabel', 'button', 'PART_ButtonSource'],
    ['Version', 'LOCVersionLabel', 'button', 'PART_ButtonVersion'],
    ['InstallSize', 'LOCInstallSizeLabel', 'text', 'PART_TextInstallSize'],
    ['InstallDirectory', 'LOCGameInstallDirTitle', 'button', 'PART_ButtonInstallDirectory'],
  ]],
  ['MetaLinks', [
    ['Links', 'LOCLinksLabel', 'items', 'PART_ItemsLinks'],
  ]],
];

/** Return META_GROUPS, optionally using Playnite's plural localization keys. */
export function metaGroups({ plural = false } = {}) {
  if (!plural) return META_GROUPS;
  return META_GROUPS.map(([groupName, fields]) => [
    groupName,
    fields.map(([name, loc, kind, part]) => [name, PLURAL_LOC_OVERRIDES[loc] || loc, kind, part]),
  ]);
}

/** Indent every non-empty line in text by n spaces. */
export function indent(text, n) {
  const pad = ' '.repeat(n);
  return text.split('\n').map(line => (line ? pad + line : line)).join('\n');
}

/** Render a FontSize/FontFamily/Brush attribute value as literal (numeric) or DynamicResource. */
function resourceOrLiteral(value) {
  return /^\d+(\.\d+)?$/.test(String(value)) ? String(value) : `{DynamicResource ${value}}`;
}

/** Build the XAML value control for a metadata field row. */
export function metadataValue(kind, part, extra = '', {
  buttonStyle = 'PropertyItemButton',
  buttonStyleKind = 'DynamicResource',
  buttonForeground = '',
  textStyle = '',
  textFontSize = '',
  textForeground = 'TextBrush',
  textVerticalCenter = true,
  scoreVerticalCenter = true,
  scoreWrap = false,
  itemsWrapPanel = true,
  chipsMargin = '',
  extraBeforeName = true,
} = {}) {
  const attrs = extraBeforeName
    ? `${extra} x:Name="${part}"`
    : ` x:Name="${part}"${extra}`;
  switch (kind) {
    case 'button': {
      const vAlign = textVerticalCenter ? ' VerticalAlignment="Center"' : '';
      const fgAttr = buttonForeground ? ` Foreground="{DynamicResource ${buttonForeground}}"` : '';
      return `<Button${attrs} HorizontalAlignment="Left"${vAlign} Style="{${buttonStyleKind} ${buttonStyle}}"${fgAttr} />`;
    }
    case 'text': {
      const vAlign = textVerticalCenter ? ' VerticalAlignment="Center"' : '';
      const sizeAttr = textFontSize ? ` FontSize="${resourceOrLiteral(textFontSize)}"` : '';
      const appearance = textStyle
        ? `Style="{DynamicResource ${textStyle}}"`
        : `Foreground="{DynamicResource ${textForeground}}"`;
      return `<TextBlock${attrs}${vAlign} TextWrapping="Wrap"${sizeAttr} ${appearance} />`;
    }
    case 'score': {
      const vAlign = scoreVerticalCenter ? ' VerticalAlignment="Center"' : '';
      const wrap = scoreWrap ? ' TextWrapping="Wrap"' : '';
      return `<TextBlock${attrs} HorizontalAlignment="Left"${vAlign} Style="{DynamicResource TextBlockGameScore}"${wrap} />`;
    }
    case 'items':
    case 'chips': {
      if (kind === 'items' && !itemsWrapPanel) {
        return `<ItemsControl${attrs} />`;
      }
      const tagAttr = chipsMargin && kind === 'chips'
        ? ` Tag="Chip" Margin="${chipsMargin}"`
        : (itemsWrapPanel ? ` Tag="${kind === 'chips' ? 'Chip' : ''}"` : ' Tag="Chip"');
      return `<ItemsControl${attrs}${tagAttr}>
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <WrapPanel />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>`;
    }
    default:
      throw new Error(`Unknown metadata field kind: ${kind}`);
  }
}

/** Collapse trigger for a metadata group when all of its PART_Elem* children collapse. */
export function collapseEmptyTrigger(elemNames) {
  if (elemNames.length === 1) {
    return `<DataTrigger Binding="{Binding Visibility, ElementName=${elemNames[0]}}" Value="Collapsed">
    <Setter Property="Visibility" Value="Collapsed" />
</DataTrigger>`;
  }
  const conds = elemNames.map(n => `<Condition Binding="{Binding Visibility, ElementName=${n}}" Value="Collapsed" />`);
  return `<MultiDataTrigger>
    <MultiDataTrigger.Conditions>
${indent(conds.join('\n'), 8)}
    </MultiDataTrigger.Conditions>
    <Setter Property="Visibility" Value="Collapsed" />
</MultiDataTrigger>`;
}

/** Style block collapsing an empty metadata group Border. */
export function collapseEmptyGroupStyle(elemNames, { targetType = 'Border', basedOn = '' } = {}) {
  const basedOnAttr = basedOn ? ` BasedOn="${basedOn}"` : '';
  return `<${targetType}.Style>
    <Style TargetType="${targetType}"${basedOnAttr}>
        <Style.Triggers>
${indent(collapseEmptyTrigger(elemNames), 12)}
        </Style.Triggers>
    </Style>
</${targetType}.Style>`;
}

/** Standard two-column metadata row (<Border> or <Grid>) with caption and value. */
export function metadataField([name, loc, kind, part], layout, {
  wrapper = 'Border',
  margin = '0,7',
  minHeight = '',
  sideColumnWidth = '108',
  sideValueWrapper = true,
  sideValueMargin = '8,0,0,0',
  captionFontFamily = '',
  captionFontWeight = '',
  captionFontSize = 'FontSizeSmall',
  captionForeground = 'TextBrushDarker',
  captionStyle = '',
  captionMargin = '0,2,0,0',
  captionSideMargin = '0,0,12,0',
  captionStackMargin = '',
  captionGridVerticalCenter = false,
  captionVerticalAlignment = '',
  captionRenderer,
  stackColumn = '2',
  stackGap = '12',
  valueOptions = {},
  scoreRenderer,
} = {}) {
  const valueMarkup = (kind === 'score' && scoreRenderer)
    ? scoreRenderer(part, layout)
    : metadataValue(kind, part, layout === 'side' && !sideValueWrapper ? ' Grid.Column="1"' : (layout === 'stack' ? ` Grid.Column="${stackColumn}"` : ''), {
      ...valueOptions,
      scoreWrap: layout === 'stack' ? (valueOptions.scoreWrap ?? true) : false,
    });
  const capStyleAttr = captionStyle ? ` Style="{DynamicResource ${captionStyle}}"` : '';
  const capFamilyAttr = captionFontFamily ? ` FontFamily="${resourceOrLiteral(captionFontFamily)}"` : '';
  const capWeightAttr = captionFontWeight ? ` FontWeight="${captionFontWeight}"` : '';
  const capFgAttr = captionForeground ? ` Foreground="{DynamicResource ${captionForeground}}"` : '';
  const capSizeAttr = captionFontSize ? ` FontSize="${resourceOrLiteral(captionFontSize)}"` : '';
  const capTextAttrs = `${capStyleAttr}${capFamilyAttr}${capWeightAttr}${capSizeAttr}${capFgAttr}`;
  const elemAttrs = `x:Name="PART_Elem${name}"${margin ? ` Margin="${margin}"` : ''}${minHeight ? ` MinHeight="${minHeight}"` : ''}`;

  if (layout === 'side') {
    const capMarginAttr = sideValueWrapper
      ? (captionMargin ? ` Margin="${captionMargin}"` : '')
      : (captionSideMargin ? ` Margin="${captionSideMargin}"` : '');
    const capVAlignAttr = captionVerticalAlignment ? ` VerticalAlignment="${captionVerticalAlignment}"` : '';
    const captionEl = captionRenderer
      ? captionRenderer(loc, layout)
      : `<TextBlock Text="{DynamicResource ${loc}}"${capTextAttrs} TextWrapping="Wrap"${capVAlignAttr}${capMarginAttr} />`;
    const valueBlock = sideValueWrapper
      ? `<Border Grid.Column="1" Margin="${sideValueMargin}">\n${indent(valueMarkup, 4)}\n</Border>`
      : valueMarkup;
    const cols = `<Grid.ColumnDefinitions>\n    <ColumnDefinition Width="${sideColumnWidth}" />\n    <ColumnDefinition Width="*" />\n</Grid.ColumnDefinitions>`;
    if (wrapper === 'Grid') {
      return `<Grid ${elemAttrs}>
${indent(cols, 4)}
${indent(captionEl, 4)}
${indent(valueBlock, 4)}
</Grid>`;
    }
    return `<Border ${elemAttrs}>
    <Grid>
${indent(cols, 8)}
${indent(captionEl, 8)}
${indent(valueBlock, 8)}
    </Grid>
</Border>`;
  }

  const vAlign = captionVerticalAlignment || (captionGridVerticalCenter ? 'Center' : 'Top');
  const stackCapMarginAttr = captionStackMargin ? ` Margin="${captionStackMargin}"` : '';
  const captionEl = captionRenderer
    ? captionRenderer(loc, layout)
    : `<TextBlock Text="{DynamicResource ${loc}}"${capTextAttrs} TextWrapping="Wrap" VerticalAlignment="${vAlign}"${stackCapMarginAttr} />`;
  const cols = stackGap
    ? `<Grid.ColumnDefinitions>\n    <ColumnDefinition Width="2*" />\n    <ColumnDefinition Width="${stackGap}" />\n    <ColumnDefinition Width="3*" />\n</Grid.ColumnDefinitions>`
    : `<Grid.ColumnDefinitions>\n    <ColumnDefinition Width="2*" />\n    <ColumnDefinition Width="3*" />\n</Grid.ColumnDefinitions>`;
  if (wrapper === 'Grid') {
    return `<Grid ${elemAttrs}>
${indent(cols, 4)}
${indent(captionEl, 4)}
${indent(valueMarkup, 4)}
</Grid>`;
  }
  return `<Border ${elemAttrs}>
    <Grid>
${indent(cols, 8)}
${indent(captionEl, 8)}
${indent(valueMarkup, 8)}
    </Grid>
</Border>`;
}

/** Standard metadata group Border with collapse-when-all-fields-collapsed trigger. */
export function metadataGroup([gname, fields], layout, {
  margin = '0,12,0,0',
  padding = '0,12,0,0',
  borderThickness = '0,1,0,0',
  borderBrush = 'WindowPanelSeparatorBrush',
  basedOn = '',
  extraBorderContent = '',
  beforeFields = '',
  fieldOptions = {},
} = {}) {
  const elemNames = fields.map(f => `PART_Elem${f[0]}`);
  const thicknessAttr = borderThickness ? ` BorderThickness="${borderThickness}"` : '';
  const brushAttr = borderBrush ? ` BorderBrush="{DynamicResource ${borderBrush}}"` : '';
  const paddingAttr = padding ? ` Padding="${padding}"` : '';
  const extraBorderBlock = extraBorderContent ? `\n${indent(extraBorderContent, 4)}` : '';
  const beforeBlock = beforeFields ? `${indent(beforeFields, 8)}\n` : '';
  return `<Border x:Name="${gname}" Margin="${margin}"${paddingAttr}${thicknessAttr}${brushAttr}>
${indent(collapseEmptyGroupStyle(elemNames, { basedOn }), 4)}${extraBorderBlock}
    <StackPanel>
${beforeBlock}${indent(fields.map(f => metadataField(f, layout, fieldOptions)).join('\n'), 8)}
    </StackPanel>
</Border>`;
}

/** Collapse an accessory element when PART_TextDisplayName is empty or null. */
export function hideWhenNoTitle(type) {
  return `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
            <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="{x:Null}">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${type}.Style>`;
}

/** Collapse a container when no game is selected ({Binding Game, FallbackValue={x:Null}} == null). */
export function hideWhenNoGame(type = 'StackPanel') {
  return `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${type}.Style>`;
}

/** Standard HeroArt Grid.Style collapsing the banner when background image is missing or window art is enabled. */
export function heroVisibilityStyle({ mode = 'height', includeNullGame = true } = {}) {
  const prop = mode === 'height' ? 'Height' : 'Visibility';
  const collapsedVal = mode === 'height' ? '0' : 'Collapsed';
  const setter = mode === 'height' ? '\n            <Setter Property="Height" Value="{DynamicResource GameBannerHeight}" />' : '';
  const nullGameTrigger = includeNullGame
    ? `\n                <DataTrigger Binding="{Binding Game.BackgroundImage}" Value="{x:Null}">\n                    <Setter Property="${prop}" Value="${collapsedVal}" />\n                </DataTrigger>`
    : '';
  return `<Grid.Style>
    <Style TargetType="Grid">${setter}
        <Style.Triggers>
            <DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageBackground}" Value="Collapsed">
                <Setter Property="${prop}" Value="${collapsedVal}" />
            </DataTrigger>
            <DataTrigger Binding="{Binding Source, ElementName=PART_ImageBackground}" Value="{x:Null}">
                <Setter Property="${prop}" Value="${collapsedVal}" />
            </DataTrigger>${nullGameTrigger}
            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</Grid.Style>`;
}

/** Banner darkening tint + 50% floor overlay (any non-zero GameBannerDarken starts at 50%). */
export function bannerDarkeningFloor() {
  return `<Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="{DynamicResource GameBannerDarken}" IsHitTestVisible="False" />
<!-- banner darkening floor: any value above 0 starts at 50%, so the result is 50% + 50% x the slider -->
<Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="0.5" Tag="{DynamicResource GameBannerDarken}" IsHitTestVisible="False">
    <Rectangle.Style>
        <Style TargetType="Rectangle">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="0">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Rectangle.Style>
</Rectangle>`;
}

/** Proportional spacer under HeroArt that falls back to a fixed floor when banner height is 0 or collapsed. */
export function bannerSpacer(expr, fallback, name = '') {
  const nameAttr = name ? ` x:Name="${name}"` : '';
  return `<Border${nameAttr} MinHeight="${fallback}" IsHitTestVisible="False">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='${expr}'}" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding ActualHeight, ElementName=HeroArt}" Value="0">
                    <Setter Property="Height" Value="${fallback}" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Visibility, ElementName=HeroArt}" Value="Collapsed">
                    <Setter Property="Height" Value="${fallback}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>`;
}

/** Outer SteamScreenshotsGameScope gate: restricts visibility to Steam plugin or Steam-source games. */
export function steamGameScope(inner, { scopeAttrs = '', comment = true } = {}) {
  const note = comment
    ? '\n    <!-- Plugin visibility is shared: a late Steam load must never reveal a different game\'s section. -->'
    : '';
  return `<Grid x:Name="SteamScreenshotsGameScope"${scopeAttrs}>${note}
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game.PluginId}" Value="${STEAM_PLUGIN_ID}">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.Source.Name}" Value="Steam">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
${inner}
</Grid>`;
}

const DEFAULT_SKELETON_CELLS = `<Grid x:Name="SkeletonCells" Margin="8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="8" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1" />
    <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1" />
</Grid>`;

/** Complete SteamScreenshots block: SteamScreenshotsGameScope + 12s loading skeleton + plugin control. */
export function steamScreenshotsGate({
  mode = 'notify',
  margin = '0,0,0,20',
  scopeAttrs = '',
  backgroundBrush = 'ExpanderBackgroundBrush',
  borderBrush = 'SlotBorderBrush',
  borderThickness = '1',
  skeletonHeight = 150,
  skeletonAttrs = '',
  skeletonContent = DEFAULT_SKELETON_CELLS,
  heading = '',
  hostName = '',
  innerMargin = '0,0,0,24',
  skeletonForeground = 'TextBrushDarker',
  includeSourceLoadingTrigger = false,
  extraAfterControl = '',
} = {}) {
  if (mode === 'storyboard') {
    const sourceTrigger = includeSourceLoadingTrigger ? `
                <MultiDataTrigger>
                    <MultiDataTrigger.Conditions>
                        <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                        <Condition Binding="{Binding Game.Source}" Value="Steam" />
                    </MultiDataTrigger.Conditions>
                    <MultiDataTrigger.EnterActions>
                        <BeginStoryboard x:Name="SteamScreenshotsLoadingSource">
                            <Storyboard>
                                <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility" Duration="0:0:12">
                                    <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                                    <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                                </ObjectAnimationUsingKeyFrames>
                            </Storyboard>
                        </BeginStoryboard>
                    </MultiDataTrigger.EnterActions>
                    <MultiDataTrigger.ExitActions>
                        <RemoveStoryboard BeginStoryboardName="SteamScreenshotsLoadingSource" />
                    </MultiDataTrigger.ExitActions>
                </MultiDataTrigger>` : '';
    const hostAttr = hostName ? ` x:Name="${hostName}"` : '';
    const stackAttr = innerMargin ? ` Margin="${innerMargin}"` : '';
    const headingBlock = heading ? `${indent(heading, 8)}\n` : '';
    const inner = `<Grid${hostAttr}>
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <MultiDataTrigger>
                    <MultiDataTrigger.Conditions>
                        <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                        <Condition Binding="{Binding Game.PluginId}" Value="${STEAM_PLUGIN_ID}" />
                    </MultiDataTrigger.Conditions>
                    <MultiDataTrigger.EnterActions>
                        <BeginStoryboard x:Name="SteamScreenshotsLoading">
                            <Storyboard>
                                <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility" Duration="0:0:12">
                                    <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                                    <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                                </ObjectAnimationUsingKeyFrames>
                            </Storyboard>
                        </BeginStoryboard>
                    </MultiDataTrigger.EnterActions>
                    <MultiDataTrigger.ExitActions>
                        <RemoveStoryboard BeginStoryboardName="SteamScreenshotsLoading" />
                    </MultiDataTrigger.ExitActions>
                </MultiDataTrigger>${sourceTrigger}
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <StackPanel${stackAttr}>
${headingBlock}        <Grid>
            <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" />
            <Control Template="{DynamicResource SteamScreenshotsSkeletonTemplate}" Foreground="{DynamicResource ${skeletonForeground}}" Focusable="False" IsTabStop="False" IsHitTestVisible="False">
                <Control.Style>
                    <Style TargetType="Control">
                        <Setter Property="Visibility" Value="Collapsed" />
                        <Style.Triggers>
                            <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False">
                                <Setter Property="Visibility" Value="Visible" />
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Control.Style>
            </Control>
        </Grid>
    </StackPanel>
</Grid>`;
    return steamGameScope(inner, { scopeAttrs });
  }

  const bgAttr = backgroundBrush ? `Background="{DynamicResource ${backgroundBrush}}"` : '';
  const brAttr = borderBrush ? `BorderBrush="{DynamicResource ${borderBrush}}"` : '';
  const btAttr = borderThickness ? `BorderThickness="${borderThickness}"` : '';
  const borderAttrs = [bgAttr, brAttr, btAttr, skeletonAttrs.trim()].filter(Boolean).join(' ');
  const attrsLine = borderAttrs ? `\n            ${borderAttrs}` : '';
  const extraAfterBlock = extraAfterControl ? `\n${extraAfterControl}` : '';
  const inner = `<ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="${margin}">
    <ContentControl.Style>
        <Style TargetType="ContentControl">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </ContentControl.Style>
</ContentControl>${extraAfterBlock}
<Grid>
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <MultiDataTrigger>
                    <MultiDataTrigger.Conditions>
                        <Condition Binding="{Binding Game.PluginId}" Value="${STEAM_PLUGIN_ID.toUpperCase()}" />
                        <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                    </MultiDataTrigger.Conditions>
                    <Setter Property="Visibility" Value="Visible" />
                </MultiDataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Border Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}" Visibility="Collapsed" Height="${skeletonHeight}" Margin="${margin}"${attrsLine}>
        <Border.Triggers>
            <EventTrigger RoutedEvent="Binding.TargetUpdated">
                <BeginStoryboard>
                    <Storyboard>
                        <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility">
                            <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                            <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                        </ObjectAnimationUsingKeyFrames>
                    </Storyboard>
                </BeginStoryboard>
            </EventTrigger>
        </Border.Triggers>
${indent(skeletonContent, 8)}
    </Border>
</Grid>`;
  return steamGameScope(inner, { scopeAttrs });
}

/** Compact-banner inline close button placed immediately before PART_ImageIcon in GridViewGameOverview. */
export function inlineCloseButton() {
  return `<Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center"
        Margin="0,0,10,0" Width="28" Height="28" Padding="0" Focusable="False" Cursor="Hand"
        ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}"
        Template="{Binding Template, ElementName=SidePanelCloseButton}">
    <Button.Style>
        <Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
            <Setter Property="Visibility" Value="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Visible\` : \`Collapsed\`'}" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Button.Style>
    <Button.RenderTransform>
        <TranslateTransform Y="{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}" />
    </Button.RenderTransform>
</Button>`;
}

/** Corner SidePanelCloseButton overlay shared by GridViewGameOverview across themes. */
export function sidePanelCloseButton({
  backgroundBrush = 'ButtonBackgroundBrush',
  borderBrush = 'NormalBorderBrush',
  glyphBrush = 'TextBrush',
  exitDuration = '0:0:0.15',
  comment = '<!-- Close: a 28x28 plate that reads at rest (the theme\'s button plate, a rim and a bright glyph) and turns the danger color on hover. -->',
  template,
} = {}) {
  const controlTemplate = template || `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent">
        <Border CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource ${backgroundBrush}}"
                BorderBrush="{DynamicResource ${borderBrush}}" BorderThickness="1" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource ${glyphBrush}}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="${exitDuration}" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
  const note = comment ? `\n    ${comment}` : '';
  return `<Button x:Name="SidePanelCloseButton" Tag="{DynamicResource GameBannerHeight}"
        HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
        Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}"
        Command="{MainViewModel CloseGameSideBarCommand}">
    <Button.Style>
        <Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
            <Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Collapsed\` : \`Visible\`'}" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Button.Style>${note}
    <Button.Template>
${indent(controlTemplate, 8)}
    </Button.Template>
</Button>`;
}

/** PageRoot background style that turns transparent when ShowBackgroundImageOnWindow is enabled. */
export function pageRootStyle(brush = 'GameOverviewBackgroundBrush', targetType = 'Grid') {
  return `<${targetType}.Style>
    <Style TargetType="${targetType}">
        <Setter Property="Background" Value="{DynamicResource ${brush}}" />
        <Style.Triggers>
            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                <Setter Property="Background" Value="Transparent" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${targetType}.Style>`;
}

/** Resolve the theme's src directory (absolute) from CLI args or relative to art/gen-overviews.mjs. A Views/ path is
 *  kept as is: writeOverviews writes straight into it. */
export function resolveThemeSrcDir(metaUrl, argv = process.argv) {
  return argv[2] ? resolve(argv[2]) : join(dirname(fileURLToPath(metaUrl)), '..', 'src');
}

/** Apply responsive breakpoints and write DetailsViewGameOverview.xaml and GridViewGameOverview.xaml. */
export function writeOverviews(outDir, detailsSource, gridSource) {
  const viewsDir = basename(outDir) === 'Views' ? outDir : join(outDir, 'Views');
  mkdirSync(viewsDir, { recursive: true });
  const responsiveDetails = applyGamePageBreakpoints(detailsSource, 'Details');
  const responsiveGrid = applyGamePageBreakpoints(gridSource, 'Grid');
  writeFileSync(join(viewsDir, 'DetailsViewGameOverview.xaml'), responsiveDetails, 'utf8');
  writeFileSync(join(viewsDir, 'GridViewGameOverview.xaml'), responsiveGrid, 'utf8');
  console.log('wrote both overviews');
}
