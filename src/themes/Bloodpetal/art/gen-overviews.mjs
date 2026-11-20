// Generates Bloodpetal's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Bloodpetal/art/gen-overviews.mjs src/themes/Bloodpetal/src
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

// Section header: the source's stone band. A 30px slab that opens with the four-point ornament and carries the heading in
// serif small capitals. BevelTemplate is a Border with a tiled mask, so the band takes its width from its host.
const header = (loc, margin = '0,0,0,14') => `<Grid Margin="${margin}" MinHeight="30">
    <Control Template="{DynamicResource BevelTemplate}" Background="{DynamicResource HeadingRuleBrush}" BorderBrush="{DynamicResource BevelShadowBrush}" BorderThickness="1" Focusable="False" />
    <DockPanel Margin="12,5,14,5">
        <Path DockPanel.Dock="Left" Width="10" Height="10" Margin="0,1,10,0" VerticalAlignment="Center" Fill="{DynamicResource HeadingMarkerBrush}" Data="M5,0.4 L6.6,2 5,3.6 3.4,2Z M2,3.4 L3.6,5 2,6.6 0.4,5Z M8,3.4 L9.6,5 8,6.6 6.4,5Z M5,6.4 L6.6,8 5,9.6 3.4,8Z" />
        <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Typography.Capitals="SmallCaps" TextTrimming="CharacterEllipsis" />
    </DockPanel>
</Grid>`;

// The metadata pane: a pitch panel in the iron frame (pewter line, dark inner line, a stud on each corner), headed by the stone band. Groups sit in a clipping wrapper whose panel is
// pulled up by 2 x 12 + 1 + 7 = 32 (first rule hidden) and down by 7.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
${indent(header('LOCGameDetails', '0,0,0,6'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-32,0,-7">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, { borderThickness: '0,1,0,0', borderBrush: 'WindowPanelSeparatorBrush' })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Control Template="{DynamicResource FramedPlateTemplate}" Foreground="{DynamicResource FrameBrush}" Focusable="False" />
</Grid>`;
}

// No OpacityMask on the banner: masked art repainted in part behind the animated Play button leaves dark seams on scaled
// displays. The fade is a plain gradient to the page color under a clotted red wash; a second gradient darkens the head.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Border Background="{DynamicResource ArtTintBrush}" Opacity="0.34" />
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

// Title: carved bone small capitals over a hard black copy of itself, and under it the four-point ornament running into a
// gem-red rule, the divider on the source's item cards. The copy and the rule follow the real title and vanish when it is empty.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <StackPanel VerticalAlignment="Center">
        <Grid>
            <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                       FontWeight="Bold" Typography.Capitals="SmallCaps" Foreground="{DynamicResource TextShadowBrush}" TextWrapping="Wrap" Margin="2,2,-2,-2" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 16)}
            </TextBlock>
            <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                       FontWeight="Bold" Typography.Capitals="SmallCaps" Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
        </Grid>
        <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource HeadingMarkerAltBrush}" Focusable="False"
                 Width="190" Height="10" HorizontalAlignment="Left" Margin="1,6,0,0">
${indent(hideWhenNoTitle('Control'), 12)}
        </Control>
    </StackPanel>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="180" Height="46">
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

const breathe = `<Storyboard RepeatBehavior="Forever" AutoReverse="True">
    <DoubleAnimation Storyboard.TargetProperty="Opacity" From="0.55" To="0.2" Duration="0:0:2.4">
        <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
    </DoubleAnimation>
</Storyboard>`;

// Petals fall by a plain Margin (one 512px tile in 26s) inside a clipped Canvas. Never animate RenderTransform from a Style
// trigger here: the template is built with no game yet, the trigger fires at once and Playnite crashes.
const drift = `<Storyboard RepeatBehavior="Forever">
    <ThicknessAnimation Storyboard.TargetProperty="Margin" From="0,-512,0,0" To="0,0,0,0" Duration="0:0:26" />
</Storyboard>`;

// Empty state: an empty item slot in the iron frame, the theme's petal dark inside it, blood light breathing behind and
// petals drifting down past it. Under the words, the source's row of page gems with one lit. Centered in the visible area.
const pip = (lit) => `<Grid Width="12" Height="12" Margin="5,0">
    <Ellipse Fill="{DynamicResource ${lit ? 'DangerBrush' : 'CheckBoxCheckMarkBkBrush'}}" Stroke="{DynamicResource ${lit ? 'BevelShadowBrush' : 'CheckBoxBorderBrush'}}" StrokeThickness="1" />
    ${lit ? '<Ellipse Width="3" Height="3" Margin="3,3,0,0" HorizontalAlignment="Left" VerticalAlignment="Top" Fill="{DynamicResource TextBrush}" Opacity="0.7" />' : ''}
</Grid>`;

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
        <Grid Width="256" Height="240" HorizontalAlignment="Center">
            <Control Template="{DynamicResource GlowFrameTemplate}" Foreground="{DynamicResource PrimaryButtonGlowBrush}" Margin="34,30,34,14" Opacity="0.4" Focusable="False">
${indent(whenEmpty('Control', 'SlotBreathe', breathe), 16)}
            </Control>
            <Grid ClipToBounds="True" IsHitTestVisible="False">
                <Canvas>
                    <Rectangle Width="256" Height="1024" Fill="{DynamicResource DangerBrush}" Margin="0,-512,0,0">
                        <Rectangle.OpacityMask>
                            <ImageBrush ImageSource="{ThemeFile 'Images/fx/petals.png'}" TileMode="Tile" Stretch="None" Viewport="0,0,256,512" ViewportUnits="Absolute" />
                        </Rectangle.OpacityMask>
${indent(whenEmpty('Rectangle', 'PetalDrift', drift), 24)}
                    </Rectangle>
                </Canvas>
                <Rectangle>
                    <Rectangle.Fill>
                        <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                            <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0" />
                            <GradientStop Color="#00000000" Offset="0.22" />
                            <GradientStop Color="#00000000" Offset="0.78" />
                            <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
                        </LinearGradientBrush>
                    </Rectangle.Fill>
                </Rectangle>
            </Grid>
            <Grid Width="112" Height="112" Margin="0,16,0,0">
                <Border Background="{DynamicResource WindowBackgourndBrush}" />
                <Border Margin="6" Background="{DynamicResource InputBackgroundBrush}" BorderBrush="{DynamicResource BevelShadowBrush}" BorderThickness="1" />
                <Viewbox Width="46" Height="46">
                    <Canvas Width="24" Height="24">
                        <Path Data="{DynamicResource IconMainMenu}" Fill="{DynamicResource NormalBorderBrush}" />
                    </Canvas>
                </Viewbox>
                <Control Template="{DynamicResource FramedPlateTemplate}" Foreground="{DynamicResource FrameBrush}" Focusable="False" />
            </Grid>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,10,0,0" Style="{DynamicResource HeadingTextBlock}" Typography.Capitals="SmallCaps" />
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
    Bloodpetal: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 360) under a clotted red wash, darkened
    at its head and faded into the page; spacer x * 200 / 360 (28 with no banner); the title in carved bone small capitals
    over the ornament rule, the actions beside it (Play socket 180x46, More and Edit 44x44 icon squares with tooltips,
    always visible); then screenshots, description and notes on the left under stone bands and the iron-framed details
    panel on the right (GameDetailsPaneWidth, 300 content width).
    Empty state: an empty item slot, drifting petals and a row of page gems. Structure: Playnite Default 10.60.
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
    Bloodpetal: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 140 / 360 (14 floor), the title over the ornament rule,
    actions under it, then text left and the iron-framed panel right (GridDetailsPaneWidth, 300 content width) with
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
${indent(sidePanelCloseButton({ preset: 'plate' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
