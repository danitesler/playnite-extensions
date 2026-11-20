// Generates Whalebone's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Whalebone/art/gen-overviews.mjs src/themes/Whalebone/src
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

const captionRenderer = (loc, layout) =>
  `<TextBlock FontFamily="{DynamicResource FontFamily}" FontSize="13" FontStyle="Italic" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" ${layout === 'side' ? 'Margin="0,1,0,0"' : 'VerticalAlignment="Top"'}>
    <ContentPresenter Content="{DynamicResource ${loc}}" />
</TextBlock>`;

// A dotted leader between an italic label and its value (the Statistics sheet).
const leader = `<Rectangle Height="1" VerticalAlignment="Bottom" Margin="6,0,6,5" MinWidth="10" Fill="{DynamicResource TextBrushDarker}" Opacity="0.5" IsHitTestVisible="False">
    <Rectangle.OpacityMask>
        <LinearGradientBrush StartPoint="0,0" EndPoint="3,0" MappingMode="Absolute" SpreadMethod="Repeat">
            <GradientStop Color="#FF000000" Offset="0" />
            <GradientStop Color="#FF000000" Offset="0.34" />
            <GradientStop Color="#00000000" Offset="0.34" />
            <GradientStop Color="#00000000" Offset="1" />
        </LinearGradientBrush>
    </Rectangle.OpacityMask>
</Rectangle>`;

const header = (loc, margin = '0,0,0,12') => `<Grid Margin="${margin}" MinHeight="30" HorizontalAlignment="Left">
    <Control Template="{DynamicResource LocalInkSmearTemplate}" Background="{DynamicResource HeadingMarkerAltBrush}" Margin="-12,0,-48,0" Focusable="False" IsHitTestVisible="False" />
    <TextBlock Style="{DynamicResource HeadingTextBlock}" Margin="0,2,0,4" TextTrimming="CharacterEllipsis">
        <ContentPresenter Content="{DynamicResource ${loc}}" />
    </TextBlock>
</Grid>`;

// Side layout: the value docks right with the dotted leader filling the room before it (the Statistics sheet).
// metadataField wraps the side value in a Border with this margin; the marker margin lets us swap that wrapper.
const SIDE_VALUE_MARK = '8,0,0,1';
const withLeaders = (markup) => markup.replace(
  new RegExp(`^( *)<Border Grid\\.Column="1" Margin="${SIDE_VALUE_MARK}">\\n([\\s\\S]*?)\\n\\1</Border>`, 'gm'),
  (_, pad, value) => `${pad}<DockPanel Grid.Column="1" Margin="8,0,0,0" LastChildFill="True">
${pad}    <Border DockPanel.Dock="Right">
${indent(value, 8)}
${pad}    </Border>
${indent(leader, pad.length + 4)}
${pad}</DockPanel>`);

const fieldOptions = { captionRenderer, margin: '0,6', sideColumnWidth: 'Auto', sideValueMargin: SIDE_VALUE_MARK };

function pane(layout, widthKey, padding) {
  const groups = META_GROUPS.map(g => metadataGroup(g, layout, { fieldOptions })).join('\n');
  return `<Grid VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" />
    <Control Template="{DynamicResource FramedPlateTemplate}" Foreground="{DynamicResource FrameInnerBrush}" Focusable="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}" Margin="0,4,0,0">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-32,0,-7">
${indent(layout === 'side' ? withLeaders(groups) : groups, 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
}

const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor({ comment: false }), 4)}
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
                <GradientStop Color="#00000000" Offset="0.24" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Cracked glass over the art: two fracture hairlines and two shards (Dishonored 2's overlays). -->
    <Path Stretch="Fill" Data="M600,0 L760,120 L972,170 M972,40 L820,96" Stroke="{DynamicResource FrameHoverBrush}" StrokeThickness="1" Opacity="0.3" />
    <Canvas HorizontalAlignment="Right" VerticalAlignment="Top" Width="0" Height="0">
        <Path Canvas.Left="-182" Canvas.Top="44" Data="M0,14 L20,0 L14,28 Z" Fill="{DynamicResource FrameHoverBrush}" Opacity="0.8" />
        <Path Canvas.Left="-168" Canvas.Top="44" Data="M0,28 L6,0 L10,20 Z" Fill="{DynamicResource SelectedSheenBrush}" Opacity="0.75" />
        <Path Canvas.Left="-72" Canvas.Top="120" Data="M0,8 L12,0 L8,18 Z" Fill="{DynamicResource FrameHoverBrush}" Opacity="0.55" />
    </Canvas>
</Grid>`;

const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Grid VerticalAlignment="Center" HorizontalAlignment="Left">
        <Control Template="{DynamicResource LocalInkSmearTemplate}" Background="{DynamicResource HeadingMarkerBrush}" Margin="-22,12,-56,-8" Focusable="False" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Control'), 12)}
        </Control>
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="30" FontWeight="Bold"
                   Foreground="Transparent" TextWrapping="Wrap" />
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="30" FontWeight="Bold"
                   Foreground="{DynamicResource TextShadowBrush}" TextWrapping="Wrap" Margin="1,2,-1,-2" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="30" FontWeight="Bold"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
    </Grid>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="200" Height="40" Margin="10,0,0,0">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Style="{DynamicResource LocalKeycapButton}" Width="40" Height="40" Padding="0" Margin="30,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Style="{DynamicResource LocalKeycapButton}" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  skeletonAttrs: 'CornerRadius="{DynamicResource ControlCornerRadius}"',
});

const textColumn = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(header('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;

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

// A glass shard that drifts up 14px and fades on a slow loop while the empty page shows (Canvas.Top and Opacity only:
// a RenderTransform animated from a Style trigger crashes Playnite).
const drift = (name, left, top, data, delay, dur, fill = 'FrameHoverBrush') => `<Path Canvas.Left="${left}" Canvas.Top="${top}" Data="${data}" Fill="{DynamicResource ${fill}}" Opacity="0">
${indent(whenEmpty('Path', name, `<Storyboard RepeatBehavior="Forever" BeginTime="0:0:${delay}">
    <DoubleAnimation Storyboard.TargetProperty="(Canvas.Top)" From="${top}" To="${top - 14}" Duration="0:0:${dur}" />
    <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
        <LinearDoubleKeyFrame KeyTime="0:0:0" Value="0" />
        <LinearDoubleKeyFrame KeyTime="0:0:${(dur * 0.3).toFixed(2)}" Value="0.75" />
        <LinearDoubleKeyFrame KeyTime="0:0:${dur}" Value="0" />
    </DoubleAnimationUsingKeyFrames>
</Storyboard>`), 4)}
</Path>`;

// Empty page: the Whalebone medallion in frost inside a ring of ticks, the caption in pen script on a crimson smear,
// a fracture rule, and three shards drifting slowly (Dishonored 2's "Death has taken you" overlay).
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
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,36">
        <Grid Width="240" Height="200" HorizontalAlignment="Center" IsHitTestVisible="False">
            <Rectangle Margin="-30,-10" Fill="{DynamicResource FocusHaloBrush}" Opacity="0.14">
                <Rectangle.OpacityMask>
                    <ImageBrush ImageSource="{ThemeFile 'Images/fx/bloom.png'}" Stretch="Fill" />
                </Rectangle.OpacityMask>
            </Rectangle>
            <Path Width="150" Height="150" Stretch="Fill" Stroke="{DynamicResource FocusHaloBrush}" StrokeThickness="1.2" Opacity="0.7"
                  Data="M20,0.5 V3.5 M33.8,6.2 L31.6,8.4 M39.5,20 H36.5 M33.8,33.8 L31.6,31.6 M20,39.5 V36.5 M6.2,33.8 L8.4,31.6 M0.5,20 H3.5 M6.2,6.2 L8.4,8.4" />
            <Ellipse Width="112" Height="112" Fill="{DynamicResource MainMenuButtonBackgroundBrush}" Stroke="{DynamicResource FrameBrush}" StrokeThickness="1" />
            <Viewbox Width="76" Height="76">
                <Canvas Width="24" Height="24">
                    <Path Data="{DynamicResource IconMainMenu}" Fill="{DynamicResource TextShadowBrush}" Opacity="0.6">
                        <Path.RenderTransform>
                            <TranslateTransform X="0.3" Y="0.4" />
                        </Path.RenderTransform>
                    </Path>
                    <Path Data="{DynamicResource IconMainMenu}" Fill="{DynamicResource FrameHoverBrush}" />
                </Canvas>
            </Viewbox>
            <Canvas Width="240" Height="200">
${indent(drift('DriftA', 34, 52, 'M0,10 L16,0 L10,22 Z', 0, 5.2), 16)}
${indent(drift('DriftB', 192, 70, 'M0,6 L12,0 L7,15 Z', 1.7, 4.6, 'SelectedSheenBrush'), 16)}
${indent(drift('DriftC', 176, 150, 'M0,4 L10,0 L4,11 Z', 3.1, 5.8), 16)}
            </Canvas>
        </Grid>
        <Grid HorizontalAlignment="Center" Margin="0,8,0,0">
            <Control Template="{DynamicResource LocalInkSmearTemplate}" Background="{DynamicResource HeadingMarkerBrush}" Margin="-24,2,-60,-2" Focusable="False" />
            <TextBlock Style="{DynamicResource HeadingTextBlock}" FontSize="24" Margin="0,2,0,6">
                <ContentPresenter Content="{DynamicResource LOCErrorNoGameSelected}" />
            </TextBlock>
        </Grid>
        <Grid Width="260" Height="16" Margin="0,8,0,0" HorizontalAlignment="Center">
            <Control Template="{DynamicResource GlowLineTemplate}" Foreground="{DynamicResource TopPanelRuleStartBrush}" BorderBrush="{DynamicResource TopPanelRuleEndBrush}" Focusable="False" />
        </Grid>
    </StackPanel>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const details = `<!--
    Whalebone: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton: banner (GameBannerHeight 300, darkened by GameBannerDarken/GameBannerTintBrush, faded to PageRoot, two
    fracture hairlines and shards over it), spacer x * 170 / 300 (20 floor), Cinzel caps title on a crimson smear with
    the brush-stroke Play (176x40) + keycap More/Edit (40x40), then Steam screenshots + description + notes under
    script captions on ink smears, left, and the 300px Statistics-sheet metadata card right (italic labels, dotted
    leaders, values). Empty state: the frost medallion, a script caption on crimson, drifting shards.
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
${indent(bannerSpacer('x * 170 / 300', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,18">
${indent(actions('18,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
                                <Grid Margin="0,20,0,0">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="26" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${indent(textColumn, 36)}
${indent(pane('side', 'GameDetailsPaneWidth', '18,16,18,18').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Whalebone: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as DetailsViewGameOverview with responsive metadata breakpoints, banner spacer x * 120 / 300
    (14 floor), and 28x28 close button (inline left of icon below 120px banner or window background on, otherwise
    top-left corner). Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 120 / 300', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${indent(gridTitle, 44)}
${indent(actions('0,16,0,0'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,20,0,0">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="24" />
                                                <ColumnDefinition Width="Auto" />
                                            </Grid.ColumnDefinitions>
${indent(textColumn, 44)}
${indent(pane('stack', 'GridDetailsPaneWidth', '18,16,18,18').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ preset: 'plate', exitDuration: '0:0:0.2', comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
