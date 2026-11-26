#!/usr/bin/env node
/**
 * Overpass: generates Views/DetailsViewGameOverview.xaml and Views/GridViewGameOverview.xaml
 * with responsive GameDetailsPanePosition (Right / Left / Center / Stretch) and 900+ / 560-899 / <560 breakpoints.
 *
 * Run: node src/themes/Overpass/art/gen-overviews.mjs
 */
import {
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  indent,
  inlineCloseButton,
  metaGroups,
  metadataField,
  pageRootStyle,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const GROUPS = metaGroups({ plural: true });

function sectionHeading(locKey) {
  return `<Grid Margin="0,0,0,10">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <Grid Grid.Column="0" Width="7" Height="7" VerticalAlignment="Center" Margin="0,0,8,0">
        <Rectangle Width="7" Height="1" Fill="{DynamicResource GlyphBrush}" HorizontalAlignment="Center" VerticalAlignment="Center" />
        <Rectangle Width="1" Height="7" Fill="{DynamicResource GlyphBrush}" HorizontalAlignment="Center" VerticalAlignment="Center" />
    </Grid>
    <TextBlock Grid.Column="1" Text="{DynamicResource ${locKey}}" Style="{DynamicResource HeadingTextBlock}" VerticalAlignment="Center" Margin="0,0,10,0" />
    <Rectangle Grid.Column="2" Height="1" VerticalAlignment="Center" Fill="{DynamicResource WindowPanelSeparatorBrush}" />
</Grid>`;
}

function secondaryActionButtons(size = 40) {
  return `<Button x:Name="PART_ButtonMoreActions" Width="${size}" Height="${size}" MinWidth="0" MinHeight="0" Padding="0" Margin="8,0,0,0"
        ToolTip="{DynamicResource LOCMoreAction}" Background="{DynamicResource SecondaryButtonBackgroundBrush}"
        BorderBrush="{DynamicResource SecondaryButtonBorderBrush}" Foreground="{DynamicResource TextBrush}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}"
                    HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="${size}" Height="${size}" MinWidth="0" MinHeight="0" Padding="0" Margin="8,0,0,0"
        ToolTip="{DynamicResource LOCEditGame}" Background="{DynamicResource SecondaryButtonBackgroundBrush}"
        BorderBrush="{DynamicResource SecondaryButtonBorderBrush}" Foreground="{DynamicResource TextBrush}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}"
                    HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False" />
</Button>`;
}

function buildMetadataStack(layout) {
  const isSide = layout === 'side';
  const blocks = [];
  for (const [gname, fields] of GROUPS) {
    const elemNames = fields.map(f => `PART_Elem${f[0]}`);
    const collapseBlock = elemNames.length === 1
      ? `<DataTrigger Binding="{Binding Visibility, ElementName=${elemNames[0]}}" Value="Collapsed"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>`
      : `<MultiDataTrigger><MultiDataTrigger.Conditions>${elemNames.map(n => `<Condition Binding="{Binding Visibility, ElementName=${n}}" Value="Collapsed" />`).join('')}</MultiDataTrigger.Conditions><Setter Property="Visibility" Value="Collapsed" /></MultiDataTrigger>`;

    // GTA IV Stats Zebra Ledger: alternating matte charcoal zebra bands with zero outer boxes
    const rows = fields.map((f, idx) => {
      const isZebra = (idx % 2 === 0);
      const raw = metadataField(f, layout, {
        wrapper: 'Border',
        margin: isSide ? '0,1' : '0,2',
        sideColumnWidth: '112',
        sideValueWrapper: true,
        sideValueMargin: '10,0,0,0',
        captionFontSize: 'FontSizeSmall',
        captionForeground: 'TextBrushDarker',
        captionMargin: '0,1,0,0',
        stackGap: '12',
        valueOptions: {
          textFontSize: 'FontSizeSmall',
          textForeground: 'TextBrush',
        },
      });
      // Give alternating rows GTA IV's crisp Stats zebra tint & compact 6px horizontal, 4px vertical inset
      const bg = isZebra ? ' Background="{DynamicResource LocalZebraBrush}"' : ' Background="Transparent"';
      return raw.replace(`<Border x:Name="PART_Elem${f[0]}"`, `<Border x:Name="PART_Elem${f[0]}" Padding="8,4"${bg}`);
    });

    blocks.push(`<Border x:Name="${gname}" Margin="0,10,0,0" Padding="0,10,0,0" BorderThickness="0,1,0,0" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
                ${collapseBlock}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
${indent(rows.join('\n'), 8)}
    </StackPanel>
</Border>`);
  }
  return blocks.join('\n');
}

function buildOverpassCloseTemplate() {
  return `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border Background="{DynamicResource InputBackgroundBrush}"
                BorderBrush="{DynamicResource PopupBorderBrush}" BorderThickness="1" IsHitTestVisible="False" />
        <!-- Tiny top-left amber crosshair ticks matching Overpass cartographic geometry -->
        <Rectangle Width="6" Height="1" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="2,2,0,0"
                   Fill="{DynamicResource GlyphBrush}" IsHitTestVisible="False" />
        <Rectangle Width="1" Height="6" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="2,2,0,0"
                   Fill="{DynamicResource GlyphBrush}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="13" Height="13" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource TextBrush}" />
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
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.16" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.72" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
}

function buildOverview(kind) {
  const isDetails = kind === 'Details';
  const targetType = isDetails ? 'DetailsViewGameOverview' : 'GridViewGameOverview';
  const prefix = isDetails ? 'Details' : 'Grid';
  const paneWidthKey = isDetails ? 'GameDetailsPaneWidth' : 'GridDetailsPaneWidth';
  const sidePad = isDetails ? 28 : 22;
  const spacerExpr = isDetails ? 'x * 204 / 300' : 'x * 182 / 300';
  const spacerFloor = isDetails ? 24 : 20;
  const colGap = isDetails ? 28 : 24;

  const steamBlock = steamScreenshotsGate({
    mode: 'storyboard',
    heading: sectionHeading('LOCScreenshotsLabel'),
    innerMargin: '0,0,0,20',
    skeletonForeground: 'TextBrushDarker',
    includeSourceLoadingTrigger: true,
  });

  const descriptionBlock = `<StackPanel x:Name="PART_ElemDescription" Margin="0,0,0,20">
${indent(sectionHeading('LOCGameDescriptionTitle'), 4)}
    <HtmlTextView x:Name="PART_HtmlDescription"
                  TextElement.Foreground="{DynamicResource LocalMapHighwayBrush}"
                  Tag="{DynamicResource LinkBrush}"
                  HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                  LinkForeground="{Binding Path=Tag.Color, RelativeSource={RelativeSource Self}}"
                  HtmlFontSize="{DynamicResource FontSize}"
                  HtmlFontFamily="{DynamicResource FontFamily}" />
</StackPanel>
<StackPanel x:Name="PART_ElemNotes" Margin="0,0,0,20">
${indent(sectionHeading('LOCNotesLabel'), 4)}
    <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap"
             Background="Transparent" BorderThickness="0" Padding="0" MinHeight="0"
             Foreground="{DynamicResource LocalMapHighwayBrush}" />
</StackPanel>`;

  const playCell = `<Grid>
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Style="{DynamicResource PlayButton}" Tag="ContextAction" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>`;

  const iconFrame = `<Border x:Name="IconFrame" Width="44" Height="44" Margin="0,0,14,0" VerticalAlignment="Center"
        Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource PopupBorderBrush}" BorderThickness="1">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageIcon}" Value="Collapsed">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageIcon}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
    <Grid>
        <Image x:Name="PART_ImageIcon" Margin="4" RenderOptions.BitmapScalingMode="Fant" Stretch="Uniform" />
        <Rectangle Width="14" Height="2" HorizontalAlignment="Left" VerticalAlignment="Bottom"
                   Fill="{DynamicResource GlyphBrush}" IsHitTestVisible="False" />
    </Grid>
</Border>`;

  const headerBlock = isDetails
    ? `<DockPanel Margin="${sidePad},6,${sidePad},14" LastChildFill="True">
    <StackPanel DockPanel.Dock="Right" Orientation="Horizontal" VerticalAlignment="Center" Margin="16,0,0,0">
${indent(playCell, 8)}
${indent(secondaryActionButtons(40), 8)}
    </StackPanel>
    <DockPanel VerticalAlignment="Center">
${indent(iconFrame, 8)}
        <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center" TextWrapping="Wrap"
                   FontFamily="{DynamicResource HeadingFontFamily}"
                   FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold"
                   Foreground="{DynamicResource HeadingForegroundBrush}" />
    </DockPanel>
</DockPanel>`
    : `<StackPanel Margin="${sidePad},6,${sidePad},14" Panel.ZIndex="4">
    <DockPanel VerticalAlignment="Center" Margin="0,0,0,12" Panel.ZIndex="4">
${indent(inlineCloseButton(), 8)}
${indent(iconFrame, 8)}
        <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center" TextWrapping="Wrap"
                   FontFamily="{DynamicResource HeadingFontFamily}"
                   FontSize="26" FontWeight="Bold"
                   Foreground="{DynamicResource HeadingForegroundBrush}" />
    </DockPanel>
    <StackPanel Orientation="Horizontal" VerticalAlignment="Center">
${indent(playCell, 8)}
${indent(secondaryActionButtons(40), 8)}
    </StackPanel>
</StackPanel>`;

  const metaBorder = `<Border Grid.Column="2" BorderThickness="0,1,0,0" BorderBrush="{DynamicResource TopPanelSeparatorBrush}" Padding="0,8,0,0">
    <Grid Width="{DynamicResource ${paneWidthKey}}">
        <Grid ClipToBounds="True">
            <StackPanel Margin="0,-21,0,-1">
${indent(buildMetadataStack(isDetails ? 'side' : 'stack'), 16)}
            </StackPanel>
        </Grid>
    </Grid>
</Border>`;

  const closeOverlay = isDetails
    ? ''
    : `\n${indent(sidePanelCloseButton({ template: buildOverpassCloseTemplate() }), 24)}`;

  return `<!--
    Overpass: Views/${targetType}.xaml (generated by art/gen-overviews.mjs + scripts/game-page-breakpoints.mjs).
    Transparent PageRoot lets Library.xaml's single continuous monochrome Liberty map stretch uninterrupted from the game list
    across the game details pane. Hero banner dissolves cleanly into the map via a BitmapCache OpacityMask (outside PlayButton).
    No top divider above the title/Play header; GTA IV Stats zebra metadata ledger with full responsive GameDetailsPanePosition.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
                    mc:Ignorable="d">

    <Style TargetType="{x:Type ${targetType}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type ${targetType}}">
                    <Grid x:Name="PageRoot" SnapsToDevicePixels="True">
${indent(pageRootStyle('GameOverviewBackgroundBrush'), 24)}
                        <ScrollViewer x:Name="PART_ScrollViewHost"
                                      Visibility="Visible"
                                      HorizontalScrollBarVisibility="Disabled"
                                      VerticalScrollBarVisibility="Visible"
                                      CanContentScroll="False">
                            <Grid>
                                <!-- Empty Game State (centered to ViewportHeight when Game == null) -->
                                <Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
                                    <Grid.Style>
                                        <Style TargetType="Grid">
                                            <Setter Property="Visibility" Value="Collapsed" />
                                            <Style.Triggers>
                                                <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                                    <Setter Property="Visibility" Value="Visible" />
                                                </DataTrigger>
                                            </Style.Triggers>
                                        </Style>
                                    </Grid.Style>
                                    <Control Template="{DynamicResource EmptyGameTemplate}" Focusable="False" IsTabStop="False" />
                                </Grid>

                                <!-- Selected Game Content -->
                                <Grid>
${indent(hideWhenNoGame('Grid'), 36)}
                                    <!-- Sharp full-bleed Hero Banner dissolving seamlessly into the continuous monochrome map underneath -->
                                    <Grid x:Name="HeroArt" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
                                        <Grid.CacheMode>
                                            <BitmapCache />
                                        </Grid.CacheMode>
                                        <Grid.OpacityMask>
                                            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                                                <GradientStop Color="#FF000000" Offset="0" />
                                                <GradientStop Color="#EE000000" Offset="0.46" />
                                                <GradientStop Color="#7A000000" Offset="0.78" />
                                                <GradientStop Color="#00000000" Offset="1" />
                                            </LinearGradientBrush>
                                        </Grid.OpacityMask>
${indent(heroVisibilityStyle({ mode: 'height', includeNullGame: true }), 40)}
                                        <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
                                                   HorizontalAlignment="Center" VerticalAlignment="Top" />
${indent(bannerDarkeningFloor(), 40)}
                                        <Rectangle IsHitTestVisible="False">
                                            <Rectangle.Fill>
                                                <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                                                    <GradientStop Color="#12000000" Offset="0" />
                                                    <GradientStop Color="#700A0B0C" Offset="0.58" />
                                                    <GradientStop Color="#C40A0B0C" Offset="1" />
                                                </LinearGradientBrush>
                                            </Rectangle.Fill>
                                        </Rectangle>
                                    </Grid>

                                    <StackPanel>
${indent(bannerSpacer(spacerExpr, spacerFloor, isDetails ? 'BannerSpacer' : 'GridBannerSpacer'), 40)}

${indent(headerBlock, 40)}

                                        <!-- Responsive Body: Main Column (Screenshots + Description + Notes) & Zebra Metadata Pane -->
                                        <Grid x:Name="${prefix}OverviewBody" Margin="${sidePad},4,${sidePad},24">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="${colGap}" />
                                                <ColumnDefinition Width="Auto" />
                                            </Grid.ColumnDefinitions>

                                            <StackPanel Grid.Column="0">
${indent(steamBlock, 48)}
${indent(descriptionBlock, 48)}
                                            </StackPanel>

${indent(metaBorder, 44)}
                                        </Grid>
                                    </StackPanel>
                                </Grid>
                            </Grid>
                        </ScrollViewer>${closeOverlay}
                    </Grid>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

const outDir = resolveThemeSrcDir(import.meta.url);
writeOverviews(outDir, buildOverview('Details'), buildOverview('Grid'));
