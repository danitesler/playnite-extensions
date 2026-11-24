// Generates Baylight 27's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Baylight/art/gen-overviews.mjs   (then node scripts/game-page-breakpoints.mjs on both files)
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

// The card's side padding: rows keep the full pane width for captions and values, the section colour reaches 14px past them.
const SIDE = 14;
// A group break is a gap in the grouped form: the closing cap of one section, 10px of window, the opening cap of the next.
const CAP = 12;
const GAP = 10;
const BREAK = CAP + GAP + CAP;

// Score: the number in semibold, coloured by TextBlockGameScore's rating states, beside a 64x4 capsule range bar filled to the
// score in the same colour (the Weather / Health range bar).
const SCORE_PROPS = { PART_TextCommunityScore: 'CommunityScore', PART_TextCriticScore: 'CriticScore', PART_TextUserScore: 'UserScore' };
const scoreRenderer = (part, layout) => `<StackPanel${layout === 'stack' ? ' Grid.Column="2"' : ''} Orientation="Horizontal" HorizontalAlignment="Right" VerticalAlignment="Center">
    <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" FontSize="13" FontWeight="SemiBold" Padding="0" Background="Transparent" VerticalAlignment="Center" />
    <Grid Width="64" Height="4" Margin="10,0,0,0" VerticalAlignment="Center" IsHitTestVisible="False">
        <Border CornerRadius="2" Background="{DynamicResource LocalSeparatorStrongBrush}" />
        <Border CornerRadius="2" HorizontalAlignment="Left" Background="{Binding Foreground, ElementName=${part}}"
                Width="{Binding Game.${SCORE_PROPS[part] || 'CommunityScore'}, Converter={StaticResource MathConverter}, ConverterParameter='x * 0.64', FallbackValue=0, TargetNullValue=0}" />
    </Grid>
</StackPanel>`;
const fieldOptions = {
  margin: '0',
  captionFontSize: '13',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};

// Rows: every field carries the section fill directly on PART_Elem* with SIDE px horizontal padding and 6px vertical padding,
// so a section reads as one rounded card without negative margins that could clip against the responsive metadata viewport.
// All values (text, buttons, multi-item lists and chips) sit at the right edge, as in a macOS settings row.
const sectionRows = (xaml) => xaml
  .replace(/<Border x:Name="(PART_Elem\w+)" Margin="0">/g,
    (_, name) => `<Border x:Name="${name}" Margin="0" Padding="${SIDE},6" Background="{DynamicResource LocalSectionBrush}">`)
  .replace(/<TextBlock Grid\.Column="2" x:Name="(PART_Text\w+)" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="\{DynamicResource TextBrush\}" \/>/g,
    (_, name) => `<TextBlock Grid.Column="2" x:Name="${name}" VerticalAlignment="Center" HorizontalAlignment="Right" TextAlignment="Right" FontSize="13" TextWrapping="Wrap" Foreground="{DynamicResource TextBrush}" />`)
  .replace(/<Button Grid\.Column="2" x:Name="(PART_Button\w+)" HorizontalAlignment="Left" VerticalAlignment="Center" Style="\{DynamicResource PropertyItemButton\}" \/>/g,
    (_, name) => `<Button Grid.Column="2" x:Name="${name}" HorizontalAlignment="Right" VerticalAlignment="Center" FontSize="13" Style="{DynamicResource PropertyItemButton}" />`)
  .replace(/<ItemsControl Grid\.Column="2" x:Name="(PART_Items\w+)" Tag="([^"]*)">\n(\s*)<ItemsControl\.ItemsPanel>\n\s*<ItemsPanelTemplate>\n\s*<WrapPanel \/>\n\s*<\/ItemsPanelTemplate>\n\s*<\/ItemsControl\.ItemsPanel>/g,
    (_, name, tag, sp) => `<ItemsControl Grid.Column="2" x:Name="${name}" Tag="${tag}" HorizontalAlignment="Right" VerticalAlignment="Center">\n${sp}<ItemsControl.Resources>\n${sp}    <Style TargetType="TextBlock"><Setter Property="FlowDirection" Value="LeftToRight" /><Setter Property="TextAlignment" Value="Right" /></Style>\n${sp}</ItemsControl.Resources>\n${sp}<ItemsControl.ItemsPanel>\n${sp}    <ItemsPanelTemplate>\n${sp}        <WrapPanel FlowDirection="RightToLeft" />\n${sp}    </ItemsPanelTemplate>\n${sp}</ItemsControl.ItemsPanel>`);

// Group break: the closing cap of the section above (rounded bottom corners), a gap of window, the opening cap of the next
// (rounded top corners). The first group's break sits above the clip (negative top margin).
const groupBreak = `<Grid Height="${BREAK}" Margin="0" IsHitTestVisible="False">
    <Border Height="${CAP}" VerticalAlignment="Top" CornerRadius="0,0,${CAP},${CAP}" Background="{DynamicResource LocalSectionBrush}" />
    <Border Height="${CAP}" VerticalAlignment="Bottom" CornerRadius="${CAP},${CAP},0,0" Background="{DynamicResource LocalSectionBrush}" />
</Grid>`;
// The metadata pane: System Settings grouped sections. An opening cap, the groups (clipped along the top so the first break
// hides), and a closing cap.
const pane = (widthKey) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <Border Padding="0">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Border Height="${CAP}" Margin="0" CornerRadius="${CAP},${CAP},0,0" Background="{DynamicResource LocalSectionBrush}" IsHitTestVisible="False" />
            <Grid>
                <Grid.Clip><RectangleGeometry Rect="0,0,100000,100000" /></Grid.Clip>
                <StackPanel Margin="0,-${BREAK},0,0">
${indent(META_GROUPS.map(g => sectionRows(metadataGroup(g, 'stack', { margin: '0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions }))).join('\n'), 20)}
                </StackPanel>
            </Grid>
            <Border Height="${CAP}" Margin="0" CornerRadius="0,0,${CAP},${CAP}" Background="{DynamicResource LocalSectionBrush}" IsHitTestVisible="False" />
        </StackPanel>
    </Border>
</Grid>`;

// Hero: the scroll edge effect. The art keeps its upper half sharp; a blurred copy of it takes over through a gradient mask
// toward the bottom, the banner darkening sits over both, and the window colour fades in last.
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
    <!-- Progressive blur: the same art, blurred, revealed from 40% down. -->
    <Grid>
        <Grid.CacheMode><BitmapCache EnableClearType="False" /></Grid.CacheMode>
        <Grid.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.4" />
                <GradientStop Color="#FF000000" Offset="0.82" />
            </LinearGradientBrush>
        </Grid.OpacityMask>
        <Image Source="{Binding Source, ElementName=PART_ImageBackground}" Stretch="UniformToFill" HorizontalAlignment="Center" VerticalAlignment="Center">
            <Image.Effect>
                <BlurEffect Radius="28" KernelType="Gaussian" RenderingBias="Performance" />
            </Image.Effect>
        </Image>
    </Grid>
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Fill="{DynamicResource GameOverviewBackgroundBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.4" />
                <GradientStop Color="#8C000000" Offset="0.74" />
                <GradientStop Color="#FF000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

// Title: the game's icon as an app-icon squircle (13px corners, a glass rim) beside its name in SF Display's bold stand-in.
const titleBody = (fontSize, iconSize) => `<Grid DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,16,0" Width="${iconSize}" Height="${iconSize}"
      Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Image x:Name="PART_ImageIcon" Width="${iconSize}" Height="${iconSize}" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant">
        <Image.Clip>
            <RectangleGeometry Rect="0,0,${iconSize},${iconSize}" RadiusX="${Math.round(iconSize * 0.23)}" RadiusY="${Math.round(iconSize * 0.23)}" />
        </Image.Clip>
    </Image>
    <Border CornerRadius="${Math.round(iconSize * 0.23)}" BorderBrush="{DynamicResource LocalGlassRimBrush}" BorderThickness="1" IsHitTestVisible="False" />
</Grid>
<TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="${fontSize}"
           Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />`;
// More and Edit: equal 36x36 glass circles (LocalGameActionSocket, Common.xaml).
const square = (name, tip, icon, style) => `<Button x:Name="${name}" Style="{DynamicResource ${style}}" Width="36" Height="36" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Width="16" Height="16" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="150" Height="36">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions', 'LocalGameActionSocket'), 4)}
${indent(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit', 'LocalGameActionEditSocket'), 4)}
</StackPanel>`;
const steam = steamScreenshotsGate({
  margin: '0,0,0,20',
  skeletonContent: '',
});
// Section heading: Title 3, semibold, label colour; no rule (macOS separates by space).
const heading = (loc) => `<TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,0,8" />`;
const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;
const hideWhenEmpty = hideWhenNoGame('StackPanel');
// Empty page: a small desktop with an idle Dock (LocalEmptyDockTemplate: the middle tile, the Baylight 27 mark, bounces every few
// seconds), the caption under it in SF Display's semibold stand-in.
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style>
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24">
        <Control Template="{DynamicResource LocalEmptyDockTemplate}" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <TextBlock x:Name="EmptyCaption" Text="{DynamicResource LOCErrorNoGameSelected}" Margin="0,20,0,0" TextAlignment="Center" TextWrapping="Wrap"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="SemiBold" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</Grid>`;
const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;
const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="24" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;
const details = `<!--
    Baylight 27: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner is the scroll edge effect (sharp art above, a blurred copy taking over below, then the window colour); the title
    is the game's name in SF Display's bold stand-in beside its icon as an app-icon squircle; Play is the Liquid Glass button
    (Siri glow on hover), More and Edit are glass circles; the metadata is a System Settings grouped form: rounded section cards
    with captions on the left, values on the right and range-bar scores.
    Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" Style="{DynamicResource DetailsScrollViewer}" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(hero, 28)}
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 214 / 300', 28, 'DetailsBannerSpacer'), 32)}
                                <DockPanel>
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(titleBody('30', 64), 36)}
                                </DockPanel>
                                <Grid Margin="0,24,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth'), 36)}
                                </Grid>
                            </StackPanel>
${indent(empty, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
// Close: a 28x28 glass circle with the xmark at rest (ButtonBackgroundBrush plate, NormalBorderBrush rim, 14px TextBrush glyph);
// on hover the danger red fades in (the red traffic light) and the glyph turns white; pressed it squashes slightly.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True" RenderTransformOrigin="0.5,0.5">
        <Grid.RenderTransform>
            <ScaleTransform x:Name="CloseLift" />
        </Grid.RenderTransform>
        <Border Background="{DynamicResource ButtonBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource CornerRadiusFull}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}" CornerRadius="{DynamicResource CornerRadiusFull}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource TextBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="CloseHoverIn"><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                    <DoubleAnimation Storyboard.TargetName="CloseLift" Storyboard.TargetProperty="ScaleX" To="1.06" Duration="0:0:0.24">
                        <DoubleAnimation.EasingFunction><BackEase EasingMode="EaseOut" Amplitude="0.3" /></DoubleAnimation.EasingFunction>
                    </DoubleAnimation>
                    <DoubleAnimation Storyboard.TargetName="CloseLift" Storyboard.TargetProperty="ScaleY" To="1.06" Duration="0:0:0.24">
                        <DoubleAnimation.EasingFunction><BackEase EasingMode="EaseOut" Amplitude="0.3" /></DoubleAnimation.EasingFunction>
                    </DoubleAnimation>
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard x:Name="CloseHoverOut"><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.16" />
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="CloseLift" Storyboard.TargetProperty="ScaleX" To="1" Duration="0:0:0.16" />
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="CloseLift" Storyboard.TargetProperty="ScaleY" To="1" Duration="0:0:0.16" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.8" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody('24', 52), 4)}
</DockPanel>`;
const grid = `<!--
    Baylight 27: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 188 / 300, a 24px title beside a 52px squircle icon, actions under it, text left and the
    grouped sections right. The panel is set off by a 1px split-view divider. Close is a glass circle that turns into the red
    traffic light on hover. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource LocalShadeBrush}">
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
${indent(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 188 / 300', 22, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,16,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,24,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: '<!-- Close: a 28x28 glass circle with the xmark; the danger red (the red traffic light) fades in on hover. -->' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
