// Generates Last Flame's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/LastFlame/art/gen-overviews.mjs src/themes/LastFlame/src
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

// A torn ink edge as vector data: no OpacityMask over the banner, so the animated Play button leaves no seams.
function tornEdge() {
  let seed = 1317;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts = [];
  for (let x = 0; x <= 1000; x += 5 + rnd() * 11) pts.push(`${x.toFixed(1)},${(4 + rnd() * rnd() * 22).toFixed(1)}`);
  return `M0,40 L0,14 ${pts.join(' ')} 1000,12 1000,40Z`;
}
const torn = tornEdge();

// Section header: bold tan heading running into the diamond and the worn gold rule.
const header = (loc, margin = '0,0,0,12') => `<DockPanel Margin="${margin}">
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" />
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource HeadingRuleBrush}" Margin="12,0,0,0" VerticalAlignment="Center" />
</DockPanel>`;

// The metadata pane: a framed panel on soot with the broken double frame. Groups sit in a clipping wrapper whose panel is
// pulled up by 2 x 12 + 1 + 7 = 32 (first rule hidden) and down by 7.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
${indent(header('LOCGameDetails', '0,0,0,4'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-32,0,-7">
${indent(META_GROUPS.map(g => metadataGroup(g, layout)).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Control Template="{DynamicResource DoubleFrameTemplate}" Foreground="{DynamicResource FrameBrush}" />
</Grid>`;
}

// No OpacityMask on the banner: masked art repainted in part behind the animated Play button leaves dark seams on scaled
// displays. The fade is a plain gradient to the page color, and the torn edge is a vector filled with the page brush.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Border Background="{DynamicResource ArtTintBrush}" Opacity="0.4" />
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.3" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Path Height="36" VerticalAlignment="Bottom" Stretch="Fill" Fill="{DynamicResource GameOverviewBackgroundBrush}" Data="${torn}" />
</Grid>`;

// Title: bold serif in tan over a hard black copy of itself (cut lettering), and the torn crimson ribbon under it, as under a
// hero's name. The copy and the ribbon follow the real title and vanish when it is empty.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <StackPanel VerticalAlignment="Center">
        <Grid>
            <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                       FontWeight="Bold" Foreground="{DynamicResource TextShadowBrush}" TextWrapping="Wrap" Margin="2,2,-2,-2" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 16)}
            </TextBlock>
            <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                       FontWeight="Bold" Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
        </Grid>
        <Control Template="{DynamicResource SelectionBarTemplate}" Foreground="{DynamicResource HeadingMarkerBrush}"
                 Width="220" Height="12" HorizontalAlignment="Left" Margin="-4,2,0,0">
${indent(hideWhenNoTitle('Control'), 12)}
        </Control>
    </StackPanel>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="172" Height="46">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="44" Height="44" Padding="0" Margin="4,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
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

const flicker = `<Storyboard RepeatBehavior="Forever">
    <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
        <LinearDoubleKeyFrame KeyTime="0:0:0" Value="1" />
        <LinearDoubleKeyFrame KeyTime="0:0:0.2" Value="0.8" />
        <LinearDoubleKeyFrame KeyTime="0:0:0.42" Value="1" />
        <LinearDoubleKeyFrame KeyTime="0:0:0.7" Value="0.74" />
        <LinearDoubleKeyFrame KeyTime="0:0:1.0" Value="0.96" />
        <LinearDoubleKeyFrame KeyTime="0:0:1.3" Value="1" />
    </DoubleAnimationUsingKeyFrames>
    <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Height">
        <LinearDoubleKeyFrame KeyTime="0:0:0" Value="108" />
        <LinearDoubleKeyFrame KeyTime="0:0:0.3" Value="116" />
        <LinearDoubleKeyFrame KeyTime="0:0:0.62" Value="103" />
        <LinearDoubleKeyFrame KeyTime="0:0:1.0" Value="114" />
        <LinearDoubleKeyFrame KeyTime="0:0:1.3" Value="108" />
    </DoubleAnimationUsingKeyFrames>
</Storyboard>`;

const breathe = `<Storyboard RepeatBehavior="Forever" AutoReverse="True">
    <DoubleAnimation Storyboard.TargetProperty="Opacity" From="0.75" To="0.4" Duration="0:0:1.7">
        <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
    </DoubleAnimation>
</Storyboard>`;

// Empty state: an iron brazier on an empty stone mark, its flame the only light. Five diamonds below it, one lit, the row
// under the game's title cards. Centered in the visible area.
const pip = (lit) => `<Path Width="11" Height="11" Stretch="Fill" Margin="4,0" Data="M5,0 L10,5 5,10 0,5Z" ${lit ? 'Fill="{DynamicResource GlyphBrush}"' : 'Stroke="{DynamicResource FrameInnerBrush}" StrokeThickness="1"'} />`;

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
        <Grid Width="240" Height="240" HorizontalAlignment="Center">
            <Control Template="{DynamicResource GlowFrameTemplate}" Foreground="{DynamicResource PrimaryButtonGlowBrush}" Margin="0,-30,0,30">
${indent(whenEmpty('Control', 'HaloBreathe', breathe), 16)}
            </Control>
            <!-- The flame grows by its plain Height inside a fixed host. Never animate RenderTransform from a Style trigger
                 here: the template is built with no game yet, the trigger fires at once and Playnite crashes. -->
            <Grid Width="72" Height="120" VerticalAlignment="Top" Margin="0,26,0,0">
                <Grid Height="108" VerticalAlignment="Bottom">
${indent(whenEmpty('Grid', 'FlameFlicker', flicker), 20)}
                    <Rectangle Fill="{DynamicResource PrimaryButtonGlowBrush}">
                        <Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/flame.png'}" Stretch="Fill" /></Rectangle.OpacityMask>
                    </Rectangle>
                    <Rectangle Fill="{DynamicResource TextBrush}">
                        <Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/flame-core.png'}" Stretch="Fill" /></Rectangle.OpacityMask>
                    </Rectangle>
                </Grid>
            </Grid>
            <Canvas Width="96" Height="80" VerticalAlignment="Bottom" Margin="0,0,0,12">
                <Path Data="M6,0 L90,0 78,22 62,30 34,30 18,22Z" Fill="{DynamicResource ButtonBackgroundBrush}" Stroke="{DynamicResource FrameBrush}" StrokeThickness="1.5" />
                <Path Data="M20,5 L24,20 M32,5 L35,24 M44,5 L45,26 M56,5 L55,26 M68,5 L65,24 M78,5 L74,20" Stroke="{DynamicResource FrameInnerBrush}" StrokeThickness="1" />
                <Path Data="M44,30 L52,30 54,62 42,62Z" Fill="{DynamicResource ButtonBackgroundBrush}" Stroke="{DynamicResource FrameBrush}" StrokeThickness="1.5" />
                <Path Data="M26,62 L70,62 78,78 18,78Z" Fill="{DynamicResource ButtonBackgroundBrush}" Stroke="{DynamicResource FrameBrush}" StrokeThickness="1.5" />
            </Canvas>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,16,0,0" Style="{DynamicResource HeadingTextBlock}" />
        <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" Margin="0,16,0,0">
            ${pip(true)}
            ${pip(false)}
            ${pip(false)}
            ${pip(false)}
            ${pip(false)}
        </StackPanel>
    </StackPanel>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

const details = `<!--
    Last Flame: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 380) under an oxblood wash, a page scrim
    and a torn ink edge; spacer x * 210 / 380 (28 with no banner); the title in cut tan lettering over the crimson ribbon, the
    actions beside it (Play pennant 172x46, More and Edit 44x44 icon squares with tooltips, always visible); then
    screenshots, description and notes on the left and the framed details panel on the right (GameDetailsPaneWidth, 300 content width).
    Empty state: a lit brazier and a row of diamonds. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 210 / 380', 20, 'DetailsBannerSpacer'), 32)}
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
    Last Flame: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 150 / 380 (52 with no banner, room for the close
    button), the title over the ribbon, actions under it, then text left and the framed panel right (GridDetailsPaneWidth,
    300 content width) with captions beside values. Close (CloseGameSideBarCommand) sits before the game icon below 120px banner height, otherwise at the top-left corner. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 150 / 380', 14, 'GridBannerSpacer'), 40)}
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
${indent(sidePanelCloseButton(), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
