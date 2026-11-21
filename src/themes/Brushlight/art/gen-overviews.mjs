// Generates Brushlight's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Brushlight/art/gen-overviews.mjs
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
// Score: a skill tree node (a turned square, charcoal with a cream hairline) holding the number in Oswald; the number keeps
// TextBlockGameScore's rating colour.
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} Width="34" Height="34" HorizontalAlignment="Left" VerticalAlignment="Center">
    <Control Template="{DynamicResource LocalNodeTemplate}" Background="{DynamicResource LocalPlateBrush}" BorderBrush="{DynamicResource LocalCreamBrush}"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" FontFamily="{DynamicResource LocalNumeralFontFamily}" FontSize="14" Padding="0" Background="Transparent"
               HorizontalAlignment="Center" VerticalAlignment="Center" TextAlignment="Center" />
</Grid>`;
const fieldOptions = {
  margin: '0,4',
  captionFontSize: 'FontSize',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};
// Group break: the Victory / Battle Loot hairline, crossed by a short cream tick and fading out to the right (DividerTemplate, 11px)
// + 6px gap. The first group's break is hidden by the pane's negative top margin: M(8) + break(17) + field margin(4) = 29.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,6"
         Background="{DynamicResource HeadingRuleBrush}" Foreground="{DynamicResource LocalCreamDimBrush}" />`;
// The metadata pane is one description card (Camera Shake / Colour of Lumina): plum-black, a bronze hairline, cream corner ticks at
// the top left and bottom right. The padding keeps 16px of card around the 300px of content.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <Control Template="{DynamicResource LocalCardTemplate}" Background="{DynamicResource LocalCardBrush}" BorderBrush="{DynamicResource LocalBronzeBrush}"
             Foreground="{DynamicResource LocalCreamBrush}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-29,0,-4">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
// Hero: the banner art, a faint smoke toward its foot, and the page's own black painting over the foot in horizontal dry-brush
// streaks (brush-foot.png as OpacityMask on a page-colour strip): the art is painted out rather than faded.
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00090807" Offset="0.35" />
                <GradientStop Color="#66090807" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Height="120" VerticalAlignment="Bottom" Margin="0,0,0,-1" Fill="{DynamicResource GameOverviewBackgroundBrush}" OpacityMask="{DynamicResource LocalBrushFootMask}" />
</Grid>`;
// Title: cream Cinzel capitals (the Victory heading) over the Victory rule: a hairline crossed by a tick, fading out to the right.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="36" MaxHeight="36" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <StackPanel VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
        <Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="-14,4,0,0" HorizontalAlignment="Stretch"
                 Background="{DynamicResource LocalCreamDimBrush}" Foreground="{DynamicResource LocalCreamDimBrush}" />
    </StackPanel>
</DockPanel>`;
const square = (name, tip, icon) => `<Button x:Name="${name}" Style="{DynamicResource LocalGameActionSocket}" Width="40" Height="40" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="184" Height="46">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${indent(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;
const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  skeletonContent: '',
});
const heading = (loc) => `<StackPanel Margin="0,0,0,8">
    <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" FontSize="{DynamicResource FontSizeLarge}" />
    <Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Width="170" HorizontalAlignment="Left" Margin="-12,2,0,0"
             Background="{DynamicResource HeadingRuleBrush}" Foreground="{DynamicResource LocalCreamDimBrush}" />
</StackPanel>`;
const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LocalCreamBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;
const hideWhenEmpty = hideWhenNoGame('StackPanel');
// Empty page: the start screen. The mark over a faint lattice with red and white petals drifting (only while visible), the caption in
// cream Cinzel over the Victory rule; shown only while no game is selected.
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style><StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24"><Control Template="{DynamicResource LocalEmptyCanvasTemplate}" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" /><TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" Margin="0,4,0,0" TextAlignment="Center" TextWrapping="Wrap" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource HeadingForegroundBrush}"/><Control Template="{DynamicResource DividerTemplate}" Width="240" Margin="0,6,0,0" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Background="{DynamicResource HeadingRuleBrush}" Foreground="{DynamicResource LocalCreamDimBrush}"/></StackPanel></Grid>`;
const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;
const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="24" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;
// The header band: smoke behind title and actions, strongest on the left and thinning to the right, bled past the page margins.
const band = (inner, bleed, pad) => `<Border Background="{DynamicResource LocalScrimBrush}" Margin="-${bleed},0,-${bleed},0" Padding="${pad}">
    <Border.OpacityMask>
        <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
            <GradientStop Color="#FF000000" Offset="0" />
            <GradientStop Color="#99000000" Offset="0.6" />
            <GradientStop Color="#33000000" Offset="1" />
        </LinearGradientBrush>
    </Border.OpacityMask>
</Border>
<Border Margin="-${bleed},0,-${bleed},0" Padding="${pad}">
${indent(inner, 4)}
</Border>`;
const details = `<!--
    Brushlight: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner is painted out into the page by horizontal dry-brush streaks (brush-foot.png), the title sits in cream Cinzel capitals over
    the Victory rule, Play is the combat command stroke over an ochre smear, More and Edit are key prompt squares, the metadata is one
    description card with tick-rule breaks, skill-node scores and lozenge chips. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 205 / 320', 20, 'DetailsBannerSpacer'), 32)}
                                <Grid>
${indent(band(`<DockPanel>
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 4)}
${indent(title, 4)}
</DockPanel>`, 28, '28,12,28,12'), 36)}
                                </Grid>
                                <Grid Margin="0,30,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '16,16,16,16'), 36)}
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
const gridTitle = title.replace('<DockPanel>', '<DockPanel Panel.ZIndex="2">').replace('    <Image', `${indent(inlineCloseButton(), 4)}\n    <Image`);
// Close: a skill tree node, 28x28: a charcoal turned square with a dim hairline and a white X at rest, the danger red node fading in on hover.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Path Stretch="Fill" Data="M0.5,0 L1,0.5 L0.5,1 L0,0.5 Z" Fill="{DynamicResource ButtonBackgroundBrush}" Stroke="{DynamicResource NormalBorderBrush}" StrokeThickness="1.2" IsHitTestVisible="False" />
        <Path x:Name="HoverPlate" Stretch="Fill" Data="M0.5,0 L1,0.5 L0.5,1 L0,0.5 Z" Fill="{DynamicResource DangerBrush}" Stroke="{DynamicResource DangerBrush}" StrokeThickness="1.2" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="11" Height="11" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
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
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
const grid = `<!--
    Brushlight: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 185 / 320, actions under the title, text left and the description card right. Close is a skill
    tree node. Structure: Playnite Default 10.60.
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
${indent(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 185 / 320', 14, 'GridBannerSpacer'), 40)}
                                        <Grid Panel.ZIndex="2">
${indent(band(`<StackPanel Panel.ZIndex="2">
${indent(gridTitle, 4)}
${indent(actions(' Margin="0,14,0,0"'), 4)}
</StackPanel>`, 22, '22,10,22,12'), 44)}
                                        </Grid>
                                        <Grid Margin="0,28,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '16,16,16,16'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: a skill tree node, 28x28: charcoal at rest with a dim hairline and a white X, the danger red node fades in on hover. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
