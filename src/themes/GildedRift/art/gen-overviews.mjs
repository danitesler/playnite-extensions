// Generates Gilded Rift's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/GildedRift/art/gen-overviews.mjs src/themes/GildedRift/src
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  hideWhenNoTitle,
  indent,
  inlineCloseButton,
  metadataGroup,
  pageRootStyle,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);
const R = key => `{DynamicResource ${key}}`;

// A score is a bordered pill: the rating colour (whatever TextBlockGameScore paints the number) as a 12% fill and a 50% edge.
// Both tints read the number's own Foreground, so Positive / Mixed / Negative follow the style, and the layers are separate
// elements so the opacity never touches the number.
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center">
    <Border Background="{Binding Foreground, ElementName=${part}}" Opacity="0.12" IsHitTestVisible="False" />
    <Border BorderBrush="{Binding Foreground, ElementName=${part}}" BorderThickness="1" Opacity="0.5" IsHitTestVisible="False" />
    <TextBlock x:Name="${part}" Style="${R('TextBlockGameScore')}" FontSize="${R('FontSizeSmall')}" Margin="7,1,7,2" />
</Grid>`;

const fieldOptions = {
  margin: '',
  minHeight: '23',
  sideColumnWidth: '96',
  sideValueMargin: '10,0,0,0',
  captionVerticalAlignment: 'Top',
  captionMargin: '0,4,0,0',
  captionStackMargin: '0,4,0,0',
  valueOptions: { textFontSize: '13' },
  scoreRenderer,
};

// A group opens with the divider (DividerTemplate: a 6px diamond and a 1px rule fading to clear) between 4px margins, 17px in all.
// The wrapper pulls the whole panel up by that 17px inside a clipping Grid, so the first visible group draws no rule.
const DIVIDER_BLOCK = 17;
const divider = `<Control Template="${R('DividerTemplate')}" Foreground="${R('FrameBrush')}" Height="9" Margin="0,4,0,4" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />`;

// A plate with its top-left and bottom-right corners cut by a fixed size, drawn as fills so nothing is painted in a page colour and
// the pane stays content-sized: two triangles in fixed corner cells, three rectangles for the rest. Stack three of them
// (inset 0 / 2 / 3) to get the 2px band, the 1px hairline and the navy fill with perfectly mitred cuts.
function notch(inset, cut, brush) {
  const c = cut;
  return `<Grid${inset ? ` Margin="${inset}"` : ''}>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="${c}" />
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="${c}" />
    </Grid.ColumnDefinitions>
    <Grid.RowDefinitions>
        <RowDefinition Height="${c}" />
        <RowDefinition Height="*" />
        <RowDefinition Height="${c}" />
    </Grid.RowDefinitions>
    <Path Data="M ${c},0 L ${c},${c} L 0,${c} Z" Fill="${brush}" />
    <Rectangle Grid.Column="1" Grid.ColumnSpan="2" Fill="${brush}" />
    <Rectangle Grid.Row="1" Grid.ColumnSpan="3" Fill="${brush}" />
    <Rectangle Grid.Row="2" Grid.ColumnSpan="2" Fill="${brush}" />
    <Path Grid.Row="2" Grid.Column="2" Data="M 0,0 L ${c},0 L 0,${c} Z" Fill="${brush}" />
</Grid>`;
}

// The pane: the notched frame (2px FrameBrush band, FrameInnerBrush hairline, NormalBrushDark fill, cuts 12 / 11 / 11) behind a Border whose
// padding is the 3px frame plus 19px of air, so the usable content width (the shared pane width key) is exactly the 300px of the spec.
function pane(layout, widthKey) {
  return `<Grid VerticalAlignment="Top">
    <Grid IsHitTestVisible="False">
${indent(notch(0, 12, R('FrameBrush')), 8)}
${indent(notch(2, 11, R('FrameInnerBrush')), 8)}
${indent(notch(3, 11, R('NormalBrushDark')), 8)}
    </Grid>
    <Border Padding="22,17,22,17">
        <StackPanel Width="${R(widthKey)}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-${DIVIDER_BLOCK},0,0">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, {
  margin: '0,0,0,0',
  padding: '',
  borderThickness: '',
  borderBrush: '',
  beforeFields: divider,
  fieldOptions,
})).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
}

// Banner. No OpacityMask on the art (masked art repainted behind the animated Play plate leaves dark seams on scaled displays): the
// fade is a plain gradient to the page colour (read from PageRoot's own brush, so ThemeModifier still applies), clear at 38% of the
// banner and solid at 96% like the preview.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.38" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.96" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

// The icon plate: a chamfered (top-left, bottom-right) frame of three stacked strokes, so the 2px gradient frame follows theme brushes:
// FrameBrush all round, BevelLightBrush fading out from the top-left, FrameInnerBrush fading in toward the bottom-right. The art sits in an
// inner plate clipped to the same chamfer, one pixel smaller. The whole plate collapses when the game has no icon.
function iconPlate(size, cut, margin) {
  const s = size;
  const outer = `M ${cut},1 L ${s - 1},1 L ${s - 1},${s - cut} L ${s - cut},${s - 1} L 1,${s - 1} L 1,${cut} Z`;
  const inner = s - 4;
  const k = cut - 1;
  const clip = `M ${k},0 L ${inner},0 L ${inner},${inner - k} L ${inner - k},${inner} L 0,${inner} L 0,${k} Z`;
  const ring = (brush, stops) => stops
    ? `<Path Data="${outer}" Stroke="${R(brush)}" StrokeThickness="2" StrokeLineJoin="Miter" IsHitTestVisible="False">
    <Path.OpacityMask>
        <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
${stops.map(([c, o]) => `            <GradientStop Color="${c}" Offset="${o}" />`).join('\n')}
        </LinearGradientBrush>
    </Path.OpacityMask>
</Path>`
    : `<Path Data="${outer}" Stroke="${R(brush)}" StrokeThickness="2" StrokeLineJoin="Miter" IsHitTestVisible="False" />`;
  return `<Grid x:Name="IconPlate" DockPanel.Dock="Left" Width="${s}" Height="${s}" Margin="${margin}" VerticalAlignment="Bottom">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageIcon}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.Icon}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Grid Margin="2" Width="${inner}" Height="${inner}" Clip="${clip}">
        <Rectangle Fill="${R('ShellBackgroundBrush')}" />
        <Image x:Name="PART_ImageIcon" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant" />
    </Grid>
${indent(ring('FrameBrush'), 4)}
${indent(ring('BevelLightBrush', [['Black', '0'], ['Black', '0.18'], ['Transparent', '0.6']]), 4)}
${indent(ring('FrameInnerBrush', [['Transparent', '0.45'], ['Black', '0.95']]), 4)}
</Grid>`;
}

// The title: the game name in Cinzel Bold (it draws lowercase as small capitals, so no text transform is needed) with a tight line box,
// and the flourish under it: DividerTemplate in GlyphBrush, 340px wide in the details view.
function titleStack(fontSize, lineHeight, flourishWidth, margin, vertical) {
  return `<StackPanel VerticalAlignment="${vertical}" Margin="${margin}">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="${R('HeadingFontFamily')}" FontWeight="Bold" FontSize="${fontSize}"
               LineHeight="${lineHeight}" LineStackingStrategy="BlockLineHeight" Foreground="${R('HeadingForegroundBrush')}" TextWrapping="Wrap" />
    <Control Template="${R('DividerTemplate')}" Foreground="${R('GlyphBrush')}" Width="${flourishWidth}" Height="9" HorizontalAlignment="Left" Margin="0,8,0,0" Focusable="False" IsTabStop="False" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Control'), 8)}
    </Control>
</StackPanel>`;
}

// Actions: the winged Play plate (196x46, its wings overhang 16px each side, so the cell keeps a 16px margin there) with the context
// action stacked in the same cell, the running overlay last; More and Edit are 40x40 icon squares with tooltips, always visible.
const actions = (kind, margin) => {
  const tag = kind === 'grid' ? 'WrapPanel' : 'StackPanel';
  return `<${tag} Orientation="Horizontal" Margin="${margin}">
    <Grid Width="196" Height="46" Margin="16,0,16,0" VerticalAlignment="Center">
        <Button x:Name="PART_ButtonPlayAction" Style="${R('PlayButton')}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="${R('PlayButton')}" />
        <Control Style="${R('RunningActionIndicator')}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="8,0,0,0" VerticalAlignment="Center" ToolTip="${R('LOCMoreAction')}">
        <ContentControl Content="${R('IconOptions')}" ContentTemplate="${R('IconTemplate')}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="10,0,0,0" VerticalAlignment="Center" ToolTip="${R('LOCEditGame')}">
        <ContentControl Content="${R('IconEdit')}" ContentTemplate="${R('IconTemplate')}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</${tag}>`;
};

const steam = steamScreenshotsGate({
  margin: '0,0,0,16',
  backgroundBrush: '',
  borderBrush: '',
  borderThickness: '',
  skeletonHeight: 128,
  skeletonContent: `<Grid x:Name="SkeletonCells">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="10" />
        <ColumnDefinition />
        <ColumnDefinition Width="10" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="${R('NormalBrushDark')}" BorderBrush="${R('FrameInnerBrush')}" BorderThickness="1" CornerRadius="${R('ControlCornerRadius')}" />
    <Border Grid.Column="2" Background="${R('NormalBrushDark')}" BorderBrush="${R('FrameInnerBrush')}" BorderThickness="1" CornerRadius="${R('ControlCornerRadius')}" />
    <Border Grid.Column="4" Background="${R('NormalBrushDark')}" BorderBrush="${R('FrameInnerBrush')}" BorderThickness="1" CornerRadius="${R('ControlCornerRadius')}" />
</Grid>`,
});

// Section heading: an 8px diamond, the Playnite caption in Cinzel Bold 13px, then a 1px rule fading to the right.
const header = (loc, margin = '0,0,0,8') => `<Grid Margin="${margin}">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <Path Data="M 4,0 L 8,4 L 4,8 L 0,4 Z" Fill="${R('HeadingMarkerBrush')}" Width="8" Height="8" Margin="0,0,12,0" VerticalAlignment="Center" IsHitTestVisible="False" />
    <TextBlock Grid.Column="1" FontFamily="${R('HeadingFontFamily')}" FontWeight="Bold" FontSize="13" Foreground="${R('HeadingForegroundBrush')}"
               VerticalAlignment="Center" TextTrimming="CharacterEllipsis" Text="${R(loc)}" />
    <Rectangle Grid.Column="2" Height="1" Margin="12,1,0,0" VerticalAlignment="Center" Fill="${R('HeadingRuleBrush')}" IsHitTestVisible="False">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="Black" Offset="0" />
                <GradientStop Color="Transparent" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

const textColumn = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="${R('FontFamily')}" HtmlFontSize="13"
                      TextElement.Foreground="${R('TextBrushDarker')}" Tag="${R('LinkBrush')}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(header('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="${R('BareTextBox')}" FontSize="13" Foreground="${R('TextBrushDarker')}" />
    </StackPanel>
</StackPanel>`;

const emptyState = `<Grid VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
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
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,24" IsHitTestVisible="False">
        <Control Template="${R('EmptyGameTemplate')}" Foreground="${R('GlyphBrush')}" BorderBrush="${R('RunningIndicatorBrush')}" Background="${R('ShellBackgroundBrush')}"
                 Width="300" Height="300" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <TextBlock Text="${R('LOCErrorNoGameSelected')}" Margin="0,-34,0,0" HorizontalAlignment="Center" TextAlignment="Center" TextTrimming="CharacterEllipsis"
                   FontFamily="${R('HeadingFontFamily')}" FontWeight="Bold" FontSize="14" Foreground="${R('HeadingForegroundBrush')}" />
        <Control Template="${R('DividerTemplate')}" Foreground="${R('FrameBrush')}" Width="180" Height="9" Margin="0,10,0,0" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    </StackPanel>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const detailsHeader = `<DockPanel Margin="0,0,0,16">
${indent(actions('details', '18,0,0,2').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Bottom"'), 4)}
${indent(iconPlate(56, 7, '0,0,14,0'), 4)}
${indent(titleStack(34, 40, 340, '0,0,0,2', 'Bottom'), 4)}
</DockPanel>`;

const details = `<!--
    Gilded Rift: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 300) fading into the page from 38% to 96%;
    spacer x * 150 / 300 (28 floor, the page's side inset); the winged icon plate (56px), the game name in Cinzel Bold 34px
    with the diamond flourish under it and the actions beside it (the winged Play plate 196x46, More and Edit 40x40 icon
    squares with tooltips, always visible); then the screenshots, description and notes under diamond heading rules on the
    left and the notched metadata frame on the right (GameDetailsPaneWidth, 300 content width; rows 23px, group rules are
    DividerTemplate). Empty state: the crystal (EmptyGameTemplate) and the no-game line. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(heroArt, 28)}
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 150 / 300', 28, 'DetailsBannerSpacer'), 32)}
${indent(detailsHeader, 32)}
                                <Grid Margin="0,0,0,0">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="24" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${indent(textColumn, 36)}
${indent(pane('side', 'GameDetailsPaneWidth').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
                                </Grid>
                            </StackPanel>
${indent(emptyState, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

const gridHeader = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(iconPlate(48, 6, '0,0,12,0').replace(' VerticalAlignment="Bottom"', ' VerticalAlignment="Center"'), 4)}
${indent(titleStack(28, 32, 240, '0', 'Center'), 4)}
</DockPanel>`;

const closeButton = sidePanelCloseButton({
  comment: '<!-- Close: a 28x28 plate with its top-left and bottom-right corners cut 5px. It reads at rest (ButtonBackgroundBrush fill, a NormalBorderBrush\n                                     rim, a 14px TextBrush glyph) and has an animated hover: a DangerBrush plate fades in over 0.12s and the glyph turns DangerForegroundBrush. -->',
  template: `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent">
        <Path Data="M 5.5,0.5 L 27.5,0.5 L 27.5,22.5 L 22.5,27.5 L 0.5,27.5 L 0.5,5.5 Z" Fill="${R('ButtonBackgroundBrush')}"
              Stroke="${R('NormalBorderBrush')}" StrokeThickness="1" StrokeLineJoin="Miter" IsHitTestVisible="False" />
        <Path x:Name="HoverPlate" Data="M 5.5,0.5 L 27.5,0.5 L 27.5,22.5 L 22.5,27.5 L 0.5,27.5 L 0.5,5.5 Z" Fill="${R('DangerBrush')}"
              Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="${R('IconWindowClose')}" ContentTemplate="${R('IconTemplate')}"
                        Foreground="${R('TextBrush')}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="${R('DangerForegroundBrush')}" />
            <Trigger.EnterActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.2" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`,
});

const gridView = `<!--
    Gilded Rift: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 100 / 300 (14 floor), the icon plate (56px) and the game
    name in Cinzel Bold 28px with the flourish, actions under it, then text left and the notched metadata frame right
    (GridDetailsPaneWidth, 300 content width) with captions beside values. Close (CloseGameSideBarCommand) is a 28x28 notched plate
    that sits before the icon below 120px banner height, otherwise at the top-left corner, and is always in the empty
    state's corner. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="${R('PanelSeparatorBrush')}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="1,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,1,0" />
                                    </DataTrigger>
                                    <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False">
                                        <Setter Property="BorderThickness" Value="0" />
                                    </DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Border.Style>
                        <Grid>
                            <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                                <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 36)}
${indent(heroArt, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 100 / 300', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${indent(gridHeader, 44)}
${indent(actions('grid', '0,16,0,0'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,4,0,0">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="24" />
                                                <ColumnDefinition Width="Auto" />
                                            </Grid.ColumnDefinitions>
${indent(textColumn, 44)}
${indent(pane('stack', 'GridDetailsPaneWidth').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(closeButton, 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
