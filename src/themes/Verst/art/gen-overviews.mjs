// Generates Verst's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Verst/art/gen-overviews.mjs src/themes/Verst/src
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
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

// A score is an odometer: the console's counter windows (OdometerTemplate) showing the score's own text. The real score TextBlock
// stays in the tree (Playnite fills it) but is collapsed; the counter reads its Text. Same windows whatever the rating.
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center">
    <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" Visibility="Collapsed" />
    <Control Template="{DynamicResource OdometerTemplate}" Tag="{Binding Text, ElementName=${part}}" Focusable="False" IsTabStop="False"
             Background="{DynamicResource TextBrush}" Foreground="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource ShellBackgroundBrush}" />
</Grid>`;

const fieldOptions = {
  margin: '0,4',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'PhosphorDimBrush',
  captionMargin: '0,2,0,0',
  valueOptions: { textFontSize: 'FontSize', textForeground: 'PhosphorBrush' },
  scoreRenderer,
};

// A group rule is the graticule's dashed line: a 1px top border painted by a tiled dash brush (4px dash, 3px gap) in dim phosphor.
const dashRule = `<Border.BorderBrush>
    <DrawingBrush TileMode="Tile" Viewport="0,0,7,1" ViewportUnits="Absolute" Viewbox="0,0,7,1" ViewboxUnits="Absolute">
        <DrawingBrush.Drawing>
            <GeometryDrawing Brush="{DynamicResource PhosphorDimBrush}">
                <GeometryDrawing.Geometry>
                    <RectangleGeometry Rect="0,0,4,1" />
                </GeometryDrawing.Geometry>
            </GeometryDrawing>
        </DrawingBrush.Drawing>
    </DrawingBrush>
</Border.BorderBrush>`;

// Section heading: the loading screen's torn orange banner (HINTS): RibbonTemplate behind the section's own Playnite caption in white
// bold condensed caps. The banner takes its width from its text and starts 4px outside the column, as the source's sticks out.
const header = (loc, margin = '-4,0,0,-4') => `<Grid Margin="${margin}" Height="30" HorizontalAlignment="Left" Panel.ZIndex="2">
    <Control Template="{DynamicResource RibbonTemplate}" Foreground="{DynamicResource HeaderBandBrush}" BorderBrush="{DynamicResource StripeBrush}" Focusable="False" IsHitTestVisible="False" />
    <ContentControl Margin="14,0,40,1" VerticalAlignment="Center" Content="{DynamicResource ${loc}}" Focusable="False" IsTabStop="False"
                    FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLarge}" Foreground="{DynamicResource HeaderBandForegroundBrush}">
        <ContentControl.ContentTemplate>
            <DataTemplate>
                <TextBlock Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" TextTrimming="CharacterEllipsis" />
            </DataTemplate>
        </ContentControl.ContentTemplate>
    </ContentControl>
</Grid>`;

// The field notebook: a sheet of worn paper (ParchmentBrush, stains and a shaded foot in PaperShadeBrush, the blue rule under the
// coils in PaperRuleBrush) with the spiral across its top (CoilStripTemplate: CoilBrush wire, punched holes in the page colour behind).
// The sheet starts 12px under the strip's top so the coils loop over its edge. Content gets ink brushes.
const notebook = (content) => `<Grid>
    <Grid Margin="0,12,0,0">
        <Border Background="{DynamicResource ParchmentBrush}" CornerRadius="{DynamicResource CornerRadiusSmall}" IsHitTestVisible="False" />
        <Rectangle Fill="{DynamicResource PaperShadeBrush}" Opacity="0.5" IsHitTestVisible="False">
            <Rectangle.OpacityMask>
                <ImageBrush ImageSource="{ThemeFile 'Images/fx/stain.png'}" TileMode="Tile" ViewportUnits="Absolute" Viewport="0,0,256,256" Stretch="Fill" />
            </Rectangle.OpacityMask>
        </Rectangle>
        <Rectangle Height="44" VerticalAlignment="Bottom" Fill="{DynamicResource PaperShadeBrush}" IsHitTestVisible="False">
            <Rectangle.OpacityMask>
                <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                    <GradientStop Color="#00000000" Offset="0" />
                    <GradientStop Color="#FF000000" Offset="1" />
                </LinearGradientBrush>
            </Rectangle.OpacityMask>
        </Rectangle>
        <Rectangle Height="1" VerticalAlignment="Top" Margin="0,19,0,0" Fill="{DynamicResource PaperRuleBrush}" IsHitTestVisible="False" />
        <Border Padding="22,30,18,14">
${indent(content, 12)}
        </Border>
    </Grid>
    <Control Template="{DynamicResource CoilStripTemplate}" Foreground="{DynamicResource CoilBrush}" Background="{DynamicResource GameOverviewBackgroundBrush}"
             VerticalAlignment="Top" Margin="10,-1,10,0" Focusable="False" IsHitTestVisible="False" />
</Grid>`;

// The oscilloscope trace: a zigzag across the foot of a screen, stretched to the host.
const wave = (attrs) => `<Path ${attrs} Stretch="Fill" StrokeThickness="1.5" StrokeLineJoin="Miter" Stroke="{DynamicResource WaveformBrush}" IsHitTestVisible="False"
      Data="M0,6 L5,1 L10,11 L15,1 L20,11 L25,1 L30,11 L35,1 L40,11 L45,1 L50,11 L55,1 L60,11 L65,1 L70,11 L75,1 L80,11 L85,1 L90,11 L95,1 L100,11 L105,1 L110,11 L115,1 L120,11 L125,1 L130,11 L135,1 L140,11 L145,1 L150,11 L155,1 L160,11 L165,1 L170,11 L175,1 L180,11 L185,1 L190,11 L195,1 L200,6" />`;

// The stencil label plate on a case: the mark and KM 0 on the ivory plate.
const stencil = (margin) => `<Border HorizontalAlignment="Left" VerticalAlignment="Top" Margin="${margin}" Height="18" Padding="5,0,7,0" CornerRadius="{DynamicResource CornerRadiusSmall}"
        Background="{DynamicResource PrimaryButtonBackgroundBrush}" IsHitTestVisible="False">
    <StackPanel Orientation="Horizontal">
        <Control Template="{DynamicResource BrandMarkTemplate}" Foreground="{DynamicResource PrimaryButtonForegroundBrush}" Width="13" Height="13" VerticalAlignment="Center" Focusable="False" />
        <TextBlock Text="KM 0" Margin="4,0,0,1" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="11"
                   Foreground="{DynamicResource PrimaryButtonForegroundBrush}" />
    </StackPanel>
</Border>`;

// The case lamp: a green core over a soft halo (PositiveRatingBrush: the same green as the running game, not its brush).
const lamp = (attrs, size = 9) => `<Grid ${attrs} Width="${size * 2}" Height="${size * 2}" IsHitTestVisible="False">
    <Rectangle Fill="{DynamicResource PositiveRatingBrush}" Opacity="0.45">
        <Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/glow.png'}" Stretch="Fill" /></Rectangle.OpacityMask>
    </Rectangle>
    <Ellipse Width="${size}" Height="${size}" Fill="{DynamicResource PositiveRatingBrush}" />
</Grid>`;

// The metadata pane: the oscilloscope unit. A dark case (CrtCaseBrush, 1px FrameBrush rim) holds the CRT glass 8px in (CrtGlassTemplate:
// graticule, scanlines, vignette, glare); phosphor captions and values; the stencil plate on the case's top edge, the case lamp at its
// top right, the waveform along the glass foot. Groups sit in a clipping wrapper whose panel is pulled up by 2 x 6 + 1 + 4 = 17
// (first rule hidden) and down by 4.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top" Margin="0,9,0,0">
    <Border Background="{DynamicResource CrtCaseBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1" CornerRadius="{DynamicResource CornerRadiusLarge}" IsHitTestVisible="False" />
    <Grid Margin="8">
        <Control Template="{DynamicResource CrtGlassTemplate}" Background="{DynamicResource CrtGlassBrush}" BorderBrush="{DynamicResource CrtGridBrush}"
                 Foreground="{DynamicResource CrtCaseBrush}" Focusable="False" IsHitTestVisible="False" />
        <Border Padding="${padding}">
            <StackPanel Width="{DynamicResource ${widthKey}}">
                <Grid ClipToBounds="True">
                    <StackPanel Margin="0,-17,0,-4">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, {
  margin: '0,6,0,0',
  padding: '0,6,0,0',
  borderThickness: '0,1,0,0',
  borderBrush: '',
  extraBorderContent: dashRule,
  fieldOptions,
})).join('\n'), 24)}
                    </StackPanel>
                </Grid>
            </StackPanel>
        </Border>
${indent(wave('Height="12" Margin="14,0,40,10" VerticalAlignment="Bottom" Opacity="0.85"'), 8)}
        <Ellipse Width="10" Height="10" Margin="0,0,16,11" HorizontalAlignment="Right" VerticalAlignment="Bottom" Stroke="{DynamicResource PhosphorDimBrush}" StrokeThickness="1.5" IsHitTestVisible="False" />
    </Grid>
${indent(stencil('14,-9,0,0'), 4)}
${indent(lamp('HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,-9,12,0"', 8), 4)}
</Grid>`;
}

// No OpacityMask on the banner: masked art repainted in part behind the animated Play button leaves dark seams on scaled
// displays. The fade is a plain gradient to the page color; a second gradient darkens the head. No wash: the source shows its art clean.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Height="110" VerticalAlignment="Top" Opacity="0.65">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0" />
                <GradientStop Color="#00000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.2" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

// Title: the workbench header. The game's source in prompt-orange caps over the game name in bold condensed white. The source
// line collapses when the game has none.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <StackPanel VerticalAlignment="Center">
        <TextBlock Text="{Binding Game.Source.Name, Converter={StaticResource StringToUpperCaseConverter}, FallbackValue=''}" Margin="1,0,0,2"
                   FontFamily="{DynamicResource FontFamily}" FontWeight="SemiBold" FontSize="{DynamicResource FontSizeSmall}" Foreground="{DynamicResource TitleSuffixBrush}">
            <TextBlock.Style>
                <Style TargetType="TextBlock">
                    <Style.Triggers>
                        <DataTrigger Binding="{Binding Game.Source, FallbackValue={x:Null}}" Value="{x:Null}">
                            <Setter Property="Visibility" Value="Collapsed" />
                        </DataTrigger>
                    </Style.Triggers>
                </Style>
            </TextBlock.Style>
        </TextBlock>
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
    </StackPanel>
</DockPanel>`;

// Actions: Play (the console display, 150x44) and the workbench's black tiles for More and Edit (40x40, tooltips, always visible).
const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid Width="150" Height="44" VerticalAlignment="Center">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="14,0,0,0" VerticalAlignment="Center" ToolTip="{DynamicResource LOCMoreAction}"
            Background="{DynamicResource SecondaryButtonBackgroundBrush}" BorderBrush="{DynamicResource SecondaryButtonBorderBrush}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="8,0,0,0" VerticalAlignment="Center" ToolTip="{DynamicResource LOCEditGame}"
            Background="{DynamicResource SecondaryButtonBackgroundBrush}" BorderBrush="{DynamicResource SecondaryButtonBorderBrush}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  borderThickness: '1',
  skeletonAttrs: 'CornerRadius="{DynamicResource ControlCornerRadius}"',
  skeletonContent: `<Grid x:Name="SkeletonCells" Margin="6">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="8" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource ControlCornerRadius}" />
    <Border Grid.Column="2" Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource ControlCornerRadius}" />
</Grid>`,
});

const description = `<HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
              TextElement.Foreground="{DynamicResource ParchmentTextBrush}" Tag="{DynamicResource ParchmentLinkBrush}"
              HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
              LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />`;

const notes = `<TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource ParchmentTextBrush}" />`;

const textColumn = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle'), 8)}
${indent(notebook(description), 8)}
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(header('LOCNotesLabel'), 8)}
${indent(notebook(notes), 8)}
    </StackPanel>
</StackPanel>`;

// Idle loops live in each element's own Style so they only run while the empty state shows (RemoveStoryboard on exit).
const whenEmpty = (type, name, story) => `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                <DataTrigger.EnterActions>
                    <BeginStoryboard x:Name="${name}">
${indent(story, 24)}
                    </BeginStoryboard>
                </DataTrigger.EnterActions>
                <DataTrigger.ExitActions>
                    <RemoveStoryboard BeginStoryboardName="${name}" />
                </DataTrigger.ExitActions>
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${type}.Style>`;

// The trace travels: a dash with one gap runs along the zigzag (StrokeDashOffset, one period per 1.4 s).
const traceRun = `<Storyboard RepeatBehavior="Forever">
    <DoubleAnimation Storyboard.TargetProperty="StrokeDashOffset" From="0" To="-46" Duration="0:0:1.4" />
</Storyboard>`;

// The case lamp blinks: two short flashes, then a hold (Opacity only).
const lampBlink = `<Storyboard RepeatBehavior="Forever">
    <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
        <DiscreteDoubleKeyFrame KeyTime="0:0:0" Value="1" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.14" Value="0.25" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.28" Value="1" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.42" Value="0.25" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.56" Value="1" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:2.4" Value="1" />
    </DoubleAnimationUsingKeyFrames>
</Storyboard>`;

// Empty state: the oscilloscope with no signal. Its battered case (a knob column with the lamp on the left, the stencil plate on top),
// the CRT glass showing the tunnel mark in dim phosphor, the "no game" line in phosphor caps, the odometer at zero and the trace
// travelling along the foot; behind it the loading screen's rail map with a handwritten "0 km" note. Loops are Opacity and
// StrokeDashOffset only (never a RenderTransform from a Style trigger here: the template is built with no game yet and Playnite
// crashes). Centered in the visible area.
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
    <Control Template="{DynamicResource RailMapTemplate}" Foreground="{DynamicResource TextBrush}" Opacity="0.07" Width="560" Height="420"
             HorizontalAlignment="Center" VerticalAlignment="Center" Focusable="False" />
    <Grid Width="380" Height="280" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,30" IsHitTestVisible="False">
        <TextBlock Text="0 км" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="-36,-44,0,0" FontFamily="{DynamicResource NoteFontFamily}" FontSize="26"
                   Foreground="{DynamicResource TextBrush}" Opacity="0.35">
            <TextBlock.LayoutTransform><RotateTransform Angle="-6" /></TextBlock.LayoutTransform>
        </TextBlock>
        <Border Background="{DynamicResource CrtCaseBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1" CornerRadius="{DynamicResource CornerRadiusLarge}" />
        <Control Template="{DynamicResource RivetsTemplate}" Foreground="{DynamicResource FrameHoverBrush}" Margin="2" Focusable="False" />
        <!-- The knob column. -->
        <StackPanel Width="40" HorizontalAlignment="Left" Margin="0,40,0,0">
            <Grid Width="18" Height="18" HorizontalAlignment="Center">
                <Rectangle Fill="{DynamicResource PositiveRatingBrush}" Opacity="0.45">
                    <Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/glow.png'}" Stretch="Fill" /></Rectangle.OpacityMask>
                </Rectangle>
                <Ellipse Width="9" Height="9" Fill="{DynamicResource PositiveRatingBrush}">
${indent(whenEmpty('Ellipse', 'LampBlink', lampBlink), 20)}
                </Ellipse>
            </Grid>
            <Ellipse Width="20" Height="20" Margin="0,18,0,0" Fill="{DynamicResource ButtonPressedBackgroundBrush}" Stroke="{DynamicResource FrameHoverBrush}" StrokeThickness="1.5" />
            <Ellipse Width="20" Height="20" Margin="0,14,0,0" Fill="{DynamicResource ButtonPressedBackgroundBrush}" Stroke="{DynamicResource FrameHoverBrush}" StrokeThickness="1.5" />
            <Ellipse Width="10" Height="10" Margin="0,16,0,0" Fill="{DynamicResource ShellBackgroundBrush}" Stroke="{DynamicResource FrameHoverBrush}" StrokeThickness="1.5" />
            <Ellipse Width="10" Height="10" Margin="0,10,0,0" Fill="{DynamicResource ShellBackgroundBrush}" Stroke="{DynamicResource FrameHoverBrush}" StrokeThickness="1.5" />
        </StackPanel>
${indent(stencil('10,-9,0,0'), 8)}
        <Grid Margin="44,14,14,14">
            <Control Template="{DynamicResource CrtGlassTemplate}" Background="{DynamicResource CrtGlassBrush}" BorderBrush="{DynamicResource CrtGridBrush}"
                     Foreground="{DynamicResource CrtCaseBrush}" Focusable="False" />
            <StackPanel VerticalAlignment="Center" Margin="18,0,18,22">
                <Control Template="{DynamicResource BrandMarkTemplate}" Foreground="{DynamicResource PhosphorDimBrush}" Width="62" Height="62" HorizontalAlignment="Center" Focusable="False" />
                <ContentControl Margin="0,12,0,0" HorizontalAlignment="Center" Content="{DynamicResource LOCErrorNoGameSelected}" Focusable="False" IsTabStop="False"
                                FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLarge}" Foreground="{DynamicResource PhosphorBrush}">
                    <ContentControl.ContentTemplate>
                        <DataTemplate>
                            <TextBlock Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" TextWrapping="Wrap" TextAlignment="Center" />
                        </DataTemplate>
                    </ContentControl.ContentTemplate>
                </ContentControl>
                <Control Template="{DynamicResource OdometerTemplate}" Tag="000000" Margin="0,12,0,0" HorizontalAlignment="Center" Focusable="False"
                         Background="{DynamicResource TextBrush}" Foreground="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource ShellBackgroundBrush}" />
            </StackPanel>
            <Path Height="12" Margin="16,0,16,14" VerticalAlignment="Bottom" Stretch="Fill" StrokeThickness="1.5" StrokeLineJoin="Miter" StrokeDashArray="27 3.67"
                  Stroke="{DynamicResource WaveformBrush}" IsHitTestVisible="False"
                  Data="M0,6 L5,1 L10,11 L15,1 L20,11 L25,1 L30,11 L35,1 L40,11 L45,1 L50,11 L55,1 L60,11 L65,1 L70,11 L75,1 L80,11 L85,1 L90,11 L95,1 L100,11 L105,1 L110,11 L115,1 L120,11 L125,1 L130,11 L135,1 L140,11 L145,1 L150,11 L155,1 L160,11 L165,1 L170,11 L175,1 L180,11 L185,1 L190,11 L195,1 L200,6">
${indent(whenEmpty('Path', 'TraceRun', traceRun), 16)}
            </Path>
        </Grid>
    </Grid>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const details = `<!--
    Verst: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 320) shown clean, darkened at its head and faded
    into the iron page; spacer x * 140 / 320 (20 floor with no banner); the source in orange caps over the game name in bold
    condensed white, the actions beside it (the console display Play 150x44, More and Edit 40x40 black workbench tiles with
    tooltips, always visible); then the screenshots in black slots, the description and notes on spiral notebook sheets under torn
    orange banners on the left, and the oscilloscope unit on the right (GameDetailsPaneWidth, 300 content width): phosphor captions
    and values, graticule rules, phosphor chips, odometer scores, the trace along its foot.
    Empty state: the oscilloscope with no signal (mark, line, odometer at zero, travelling trace, blinking lamp) over the rail map.
    Structure: Playnite Default 10.60.
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
                            <StackPanel Margin="30,0,30,30">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 140 / 320', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,18">
${indent(actions('18,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
                                <Grid Margin="0,14,0,0">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="24" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${indent(textColumn, 36)}
${indent(pane('side', 'GameDetailsPaneWidth', '14,14,14,34').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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

const gridTitle = title.replace('<DockPanel>', '<DockPanel Panel.ZIndex="2">').replace('    <Image', `${indent(inlineCloseButton(), 4)}\n    <Image`);

const gridView = `<!--
    Verst: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 110 / 320 (14 floor), the source over the game name, actions
    under it, then the notebook text left and the oscilloscope unit right (GridDetailsPaneWidth, 300 content width) with captions
    beside values. Close (CloseGameSideBarCommand) sits before the game icon below 120px banner height, otherwise at the top-left
    corner. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource PanelSeparatorBrush}">
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
${indent(bannerSpacer('x * 110 / 320', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${indent(gridTitle, 44)}
${indent(actions('0,16,0,0'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,14,0,0">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="24" />
                                                <ColumnDefinition Width="Auto" />
                                            </Grid.ColumnDefinitions>
${indent(textColumn, 44)}
${indent(pane('stack', 'GridDetailsPaneWidth', '14,14,14,34').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ preset: 'plate', exitDuration: '0:0:0.2' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
