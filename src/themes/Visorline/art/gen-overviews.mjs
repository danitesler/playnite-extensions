// Generates Visorline's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Visorline/art/gen-overviews.mjs src/themes/Visorline/src
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

const scoreKey = { PART_TextCommunityScore: 'CommunityScore', PART_TextCriticScore: 'CriticScore', PART_TextUserScore: 'UserScore' };
// A score: the HUD's segmented stat bar (the shared ProgressBar, 0-100) with the number after it.
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''}>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <ProgressBar Height="9" Minimum="0" Maximum="100" VerticalAlignment="Center" Margin="0,0,10,0"
                 Value="{Binding Game.${scoreKey[part]}, Mode=OneWay, TargetNullValue=0, FallbackValue=0}" />
    <TextBlock x:Name="${part}" Grid.Column="1" HorizontalAlignment="Right" VerticalAlignment="Center" Style="{DynamicResource TextBlockGameScore}" />
</Grid>`;

// Section header: the hex bullet the source's honeycomb gives every heading, the heading in the display face, then a
// hairline for the rest of the row. Every part takes its width from its host.
const header = (loc, margin = '0,0,0,14') => `<DockPanel Margin="${margin}" MinHeight="26">
    <Path DockPanel.Dock="Left" Width="8" Height="9" Margin="0,0,10,0" VerticalAlignment="Center" Fill="{DynamicResource HeadingMarkerBrush}" Data="M4,0 L8,2.25 L8,6.75 L4,9 L0,6.75 L0,2.25Z" />
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

// The metadata pane: one of the source's cards, a black body in a single hairline, headed like a section. Groups sit in a clipping wrapper whose panel is
// pulled up by 2 x 12 + 1 + 7 = 32 (first rule hidden) and down by 7.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
${indent(header('LOCGameDetails', '0,0,0,6'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-32,0,-7">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, { fieldOptions: { scoreRenderer } })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Control Template="{DynamicResource FramedPlateTemplate}" Foreground="{DynamicResource FrameBrush}" Focusable="False" />
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
    <!-- the source's angled corner lines, over the art's top corners -->
    <Path Width="64" Height="14" Margin="24,16,0,0" HorizontalAlignment="Left" VerticalAlignment="Top" Data="M0,14 L14,0 L64,0" Stroke="{DynamicResource GlyphBrush}" StrokeThickness="1" Opacity="0.4" IsHitTestVisible="False" />
    <Path Width="64" Height="14" Margin="0,16,24,0" HorizontalAlignment="Right" VerticalAlignment="Top" Data="M0,0 L50,0 L64,14" Stroke="{DynamicResource GlyphBrush}" StrokeThickness="1" Opacity="0.4" IsHitTestVisible="False" />
</Grid>`;

// Title: the source's screen title. The game name in the display face, uppercase (Playnite's StringToUpperCaseConverter on a
// copy bound to the real part), HUD white over a hard black copy, with a hex bullet before it. PART_TextDisplayName keeps
// its place in the layout but is drawn transparent; the copies and the bullet vanish when it is empty.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Path DockPanel.Dock="Left" Width="14" Height="16" Margin="0,14,12,0" VerticalAlignment="Top" Fill="{DynamicResource HeadingMarkerBrush}" Data="M7,0 L14,4 L14,12 L7,16 L0,12 L0,4Z" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Path'), 8)}
    </Path>
    <Grid VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="Transparent" TextWrapping="Wrap" />
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource TextShadowBrush}" TextWrapping="Wrap" Margin="2,2,-2,-2" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
    </Grid>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid Width="210" Height="48">
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

// The minimap's compass strip: a hairline with ruler ticks hanging under it and the HUD's yellow marker riding it at 62%.
const strip = (margin) => `<Grid Height="16" Margin="${margin}" IsHitTestVisible="False">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="62*" />
        <ColumnDefinition Width="38*" />
    </Grid.ColumnDefinitions>
    <Control Grid.ColumnSpan="2" Template="{DynamicResource RulerLineTemplate}" Foreground="{DynamicResource GlyphBrush}" BorderBrush="{DynamicResource GlyphBrush}" Focusable="False" />
    <Path HorizontalAlignment="Right" VerticalAlignment="Center" Width="9" Height="9" Margin="0,0,-4,0" Fill="{DynamicResource DataChangeNotifBrush}" Data="M4.5,0 L9,4.5 L4.5,9 L0,4.5Z" />
</Grid>`;

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

const breathe = `<Storyboard RepeatBehavior="Forever" AutoReverse="True">
    <DoubleAnimation Storyboard.TargetProperty="Opacity" From="0.95" To="0.45" Duration="0:0:2">
        <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
    </DoubleAnimation>
</Storyboard>`;

// Empty state: the source's INITIALIZING notice. The theme's own mark in the mint rule over a soft bloom that breathes on a 4s loop
// (Opacity only: never animate a RenderTransform from a Style trigger here, the template is built with no game yet and Playnite
// crashes), four angled corner brackets framing it, the words between two angle brackets and a ruler rule under them.
// Centered in the visible area.
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
        <Control Template="{DynamicResource EmptyGameTemplate}" Width="340" Height="210" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" Margin="0,4,0,0">
            <TextBlock Text="&#8249;" Margin="0,0,14,2" Style="{DynamicResource HeadingTextBlock}" Foreground="{DynamicResource HeadingMarkerBrush}" />
            <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" Style="{DynamicResource HeadingTextBlock}" />
            <TextBlock Text="&#8250;" Margin="14,0,0,2" Style="{DynamicResource HeadingTextBlock}" Foreground="{DynamicResource HeadingMarkerBrush}" />
        </StackPanel>
        <Grid Width="260" Height="16" Margin="0,8,0,0" HorizontalAlignment="Center">
            <Control Template="{DynamicResource RulerLineTemplate}" Foreground="{DynamicResource TopPanelRuleStartBrush}" BorderBrush="{DynamicResource TopPanelRuleEndBrush}" Focusable="False" />
        </Grid>
    </StackPanel>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const details = `<!--
    Visorline: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 300) shown clean with two angled corner lines, darkened
    at its head and faded into the page; spacer x * 200 / 360 (28 with no banner); the game name as a screen title (display face, uppercase,
    HUD white, hex bullet before it), the actions beside it (Play plate 210x48, More and Edit 44x44 icon squares with tooltips, always
    visible); then the compass strip (a ruler with the HUD's marker); then screenshots, description and notes on the left under hex headings
    and the details card on the right (GameDetailsPaneWidth, 300 content width) with scores as segmented bars.
    Empty state: the theme's mark over a breathing bloom between angle brackets. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 200 / 360', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,18">
${indent(actions('18,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
${indent(strip('0,0,0,0'), 32)}
                                <Grid Margin="0,12,0,0">
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
    Visorline: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 140 / 360 (14 floor), the screen title,
    actions under it, the compass strip, then text left and the details card right (GridDetailsPaneWidth, 300 content width) with
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
${indent(bannerSpacer('x * 140 / 360', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${indent(gridTitle, 44)}
${indent(actions('0,16,0,0'), 44)}
                                        </StackPanel>
${indent(strip('0,0,0,0'), 40)}
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
