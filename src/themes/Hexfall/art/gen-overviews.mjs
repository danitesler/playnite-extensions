// Generates Hexfall's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Hexfall/art/gen-overviews.mjs src/themes/Hexfall/src
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

const captionRenderer = (loc, layout) => `<TextBlock FontFamily="{DynamicResource HeadingFontFamily}" FontSize="10" FontWeight="SemiBold" Foreground="{DynamicResource SectionHeaderBrush}" TextWrapping="Wrap" ${layout === 'side' ? 'Margin="0,3,0,0"' : 'VerticalAlignment="Top"'}>
    <ContentPresenter Content="{DynamicResource ${loc}}">
        <ContentPresenter.Resources>
            <DataTemplate DataType="{x:Type sys:String}">
                <AccessText Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" />
            </DataTemplate>
        </ContentPresenter.Resources>
    </ContentPresenter>
</TextBlock>`;

// Section header: the amber double slash the source puts before a heading ("//Imperial Archives"), the heading in the
// display face, then a hairline for the rest of the row. Every part takes its width from its host.
const header = (loc, margin = '0,0,0,14') => `<DockPanel Margin="${margin}" MinHeight="26">
    <Path DockPanel.Dock="Left" Width="14" Height="12" Margin="0,0,10,0" VerticalAlignment="Center" Fill="{DynamicResource HeadingMarkerBrush}" Data="M5,0 L8,0 3,12 0,12Z M11,0 L14,0 9,12 6,12Z" />
    <TextBlock DockPanel.Dock="Left" Style="{DynamicResource HeadingTextBlock}" TextTrimming="CharacterEllipsis">
        <ContentPresenter Content="{DynamicResource ${loc}}">
            <ContentPresenter.Resources>
                <DataTemplate DataType="{x:Type sys:String}">
                    <AccessText Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" />
                </DataTemplate>
            </ContentPresenter.Resources>
        </ContentPresenter>
    </TextBlock>
    <Rectangle Height="1" Margin="14,2,0,0" VerticalAlignment="Center" Fill="{DynamicResource HeadingRuleBrush}" IsHitTestVisible="False" />
</DockPanel>`;

// The metadata pane: the source's planet scan panel. A navy body with two cut corners in a steel frame (ChamferTemplate),
// crowned by the cap bar (strip, notch, three lamps). No group captions (a theme cannot ship strings). Groups sit in a
// clipping wrapper whose panel is pulled up by 2 x 12 + 1 + 7 = 32 (first rule hidden) and down by 7.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Control Template="{DynamicResource ChamferTemplate}" Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" Focusable="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}" Margin="0,10,0,0">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-32,0,-7">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, { fieldOptions: { captionRenderer } })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Control Template="{DynamicResource RivetsTemplate}" Height="10" VerticalAlignment="Top" Focusable="False" IsHitTestVisible="False" />
</Grid>`;
}

// No OpacityMask on the banner: masked art repainted in part behind the animated Play button leaves dark seams on scaled
// displays. The fade is a plain gradient to the page color; a second gradient darkens the head. No wash: the source shows its art clean.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Height="120" VerticalAlignment="Top" Opacity="0.7">
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
                <GradientStop Color="#00000000" Offset="0.25" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

// Title: the source's screen title. The game name in the display face, uppercase (Playnite's StringToUpperCaseConverter on a
// copy bound to the real part), pale over a hard dark copy, with the amber double slash before it. PART_TextDisplayName keeps
// its place in the layout but is drawn transparent; the copies and the tab vanish when it is empty.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Path DockPanel.Dock="Left" Width="22" Height="28" Margin="0,4,12,0" VerticalAlignment="Top" Fill="{DynamicResource HeadingMarkerBrush}" Data="M8,0 L13,0 5,28 0,28Z M17,0 L22,0 14,28 9,28Z" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Path'), 8)}
    </Path>
    <Grid VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="28" FontWeight="SemiBold"
                   Foreground="Transparent" TextWrapping="Wrap" />
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="28" FontWeight="SemiBold"
                   Foreground="{DynamicResource TextShadowBrush}" TextWrapping="Wrap" Margin="2,2,-2,-2" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="28" FontWeight="SemiBold"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
    </Grid>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="190" Height="48">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="44" Height="44" Padding="0" Margin="12,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="44" Height="44" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const textColumn = `<StackPanel>
${indent(steamScreenshotsGate(), 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource GlyphBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(header('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
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

// One hexagon ring that pings outward: Width, Height and Opacity only (never a RenderTransform from a Style trigger).
const ping = (name, delay) => whenEmpty('Polygon', name, `<Storyboard RepeatBehavior="Forever" BeginTime="0:0:${delay}">
    <DoubleAnimation Storyboard.TargetProperty="Width" From="56" To="300" Duration="0:0:3.2"><DoubleAnimation.EasingFunction><CubicEase EasingMode="EaseOut" /></DoubleAnimation.EasingFunction></DoubleAnimation>
    <DoubleAnimation Storyboard.TargetProperty="Height" From="56" To="300" Duration="0:0:3.2"><DoubleAnimation.EasingFunction><CubicEase EasingMode="EaseOut" /></DoubleAnimation.EasingFunction></DoubleAnimation>
    <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
        <LinearDoubleKeyFrame KeyTime="0:0:0" Value="0" />
        <LinearDoubleKeyFrame KeyTime="0:0:0.3" Value="0.55" />
        <LinearDoubleKeyFrame KeyTime="0:0:3.2" Value="0" />
    </DoubleAnimationUsingKeyFrames>
</Storyboard>`);

const pingRing = (name, delay) => `<Polygon Points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" Stretch="Fill" Width="56" Height="56" Fill="Transparent" Stroke="{DynamicResource TitleSuffixBrush}" StrokeThickness="1" Opacity="0">
${indent(ping(name, delay), 4)}
</Polygon>`;

// Empty state: the source's title screen, the faint radar rings behind the logo. Here the theme's own mark in cyan at the
// centre of a radar (rings and ticks from a generated sprite) with three hexagon rings that ping outward on a 3.2s loop,
// the words under it behind an amber double slash. Centered in the visible area.
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
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,40">
        <Grid Width="300" Height="300" HorizontalAlignment="Center" IsHitTestVisible="False" ClipToBounds="True">
            <Rectangle Fill="{DynamicResource TitleSuffixBrush}" Opacity="0.3">
                <Rectangle.OpacityMask>
                    <ImageBrush ImageSource="{ThemeFile 'Images/fx/radar.png'}" Stretch="Uniform" />
                </Rectangle.OpacityMask>
            </Rectangle>
${indent(pingRing('PingA', 0), 12)}
${indent(pingRing('PingB', 1.07), 12)}
${indent(pingRing('PingC', 2.13), 12)}
            <Viewbox Width="96" Height="96">
                <Canvas Width="24" Height="24">
                    <Path Data="{DynamicResource IconMainMenu}" Fill="{DynamicResource TextShadowBrush}" Opacity="0.55">
                        <Path.RenderTransform>
                            <TranslateTransform X="0.35" Y="0.45" />
                        </Path.RenderTransform>
                    </Path>
                    <Path Data="{DynamicResource IconMainMenu}" Fill="{DynamicResource TitleSuffixBrush}" />
                </Canvas>
            </Viewbox>
        </Grid>
        <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" Margin="0,2,0,0">
            <Path Width="14" Height="12" Margin="0,0,10,0" VerticalAlignment="Center" Fill="{DynamicResource HeadingMarkerBrush}" Data="M5,0 L8,0 3,12 0,12Z M11,0 L14,0 9,12 6,12Z" />
            <TextBlock Style="{DynamicResource HeadingTextBlock}">
                <ContentPresenter Content="{DynamicResource LOCErrorNoGameSelected}">
                    <ContentPresenter.Resources>
                        <DataTemplate DataType="{x:Type sys:String}">
                            <AccessText Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" />
                        </DataTemplate>
                    </ContentPresenter.Resources>
                </ContentPresenter>
            </TextBlock>
        </StackPanel>
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
    Hexfall: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 340) shown clean, darkened at its
    head and faded into the page; spacer x * 200 / 340 (28 with no banner); the game name as a screen title (display
    face, uppercase, the amber double slash before it), the actions beside it (Play plate 190x48, More and Edit 44x44 icon
    squares with tooltips, always visible); then screenshots, description and notes on the left under tab headings and
    the details card on the right (GameDetailsPaneWidth, 300 content width).
    Empty state: the theme's mark in cyan at the centre of a radar with three hexagon rings that ping outward. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 200 / 340', 20, 'DetailsBannerSpacer'), 32)}
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
${indent(pane('side', 'GameDetailsPaneWidth', '20,18,20,20').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Hexfall: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 140 / 340 (14 floor), the screen title,
    actions under it, then text left and the details card right (GridDetailsPaneWidth, 300 content width) with
    captions beside values. Close (CloseGameSideBarCommand) sits before the game icon below 120px banner height,
    otherwise at the top-left corner. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 140 / 340', 14, 'GridBannerSpacer'), 40)}
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
${indent(sidePanelCloseButton({ exitDuration: '0:0:0.2' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
