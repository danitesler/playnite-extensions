// Generates Relay's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Relay/art/gen-overviews.mjs
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

const fieldOptions = {
  margin: '0,8',
  captionStackMargin: '0,2,0,0',
  valueOptions: { scoreWrap: false },
};

// The metadata pane: the codex side panel. A warm black plate with cut top-left and bottom-right corners and a copper
// rim, a faint copper rim bloom, the orange "+" marker on its top-right and a short lime tick along its top-left edge.
// The padded Border keeps the content width at the pane width; the plate behind it draws the frame.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <Control Template="{DynamicResource GlowFrameTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="-28" Opacity="0.16"
             Foreground="{DynamicResource FrameBrush}" />
    <Control Template="{DynamicResource ChamferTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Padding="12"
             Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" />
    <Border Background="Transparent" BorderBrush="Transparent" BorderThickness="1" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-8">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Path Data="F1M0,0H44L41,3H0Z" Margin="16,-1,0,0" HorizontalAlignment="Left" VerticalAlignment="Top" Fill="{DynamicResource GlyphBrush}" IsHitTestVisible="False" />
    <Path Data="{DynamicResource IconAdd}" Width="9" Height="9" Stretch="Fill" Margin="0,7,7,0" HorizontalAlignment="Right" VerticalAlignment="Top"
          Fill="{DynamicResource HeadingMarkerBrush}" IsHitTestVisible="False" />
</Grid>`;

// Banner: art under the menus' amber wash and 3px scanlines, then a plain gradient into the page color.
// No OpacityMask: the banner sits behind the animated Play button.
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Border Background="{DynamicResource ArtTintBrush}" Opacity="0.3" />
    <Canvas HorizontalAlignment="Left" VerticalAlignment="Top" Opacity="0.35">
        <Path Data="{DynamicResource IconScanlines}" Fill="{DynamicResource ScrimBrush}" />
    </Canvas>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.3" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.96" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="32" MaxHeight="32" Margin="0,0,12,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" VerticalAlignment="Center" />
</DockPanel>`;

const square = (name, tip, icon) => `<Button x:Name="${name}" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="160" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${indent(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;

const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  skeletonContent: '<Control Template="{DynamicResource CornerMarksTemplate}" Focusable="False" IsTabStop="False" Margin="24" Foreground="{DynamicResource FrameBrush}" />',
});

// Description and notes carry no words above them, only the menus' heading rule: a dark copper line with an orange tick.
const ramp = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Width="140" HorizontalAlignment="Left" Margin="0,0,0,12"
         Foreground="{DynamicResource HeadingMarkerBrush}" />`;

const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(ramp, 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource GlyphBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(ramp, 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

// A loop that runs only while no game is selected. Plain properties only: Style triggers fire during template creation.
const idle = (type, name, body) => `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                <DataTrigger.EnterActions>
                    <BeginStoryboard x:Name="${name}">
                        <Storyboard RepeatBehavior="Forever">
${indent(body, 28)}
                        </Storyboard>
                    </BeginStoryboard>
                </DataTrigger.EnterActions>
                <DataTrigger.ExitActions>
                    <RemoveStoryboard BeginStoryboardName="${name}" />
                </DataTrigger.ExitActions>
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${type}.Style>`;

const fade = (times, dur = 3) => `<DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity" Duration="0:0:${dur}">
${times.map(([t, v]) => `    <LinearDoubleKeyFrame KeyTime="0:0:${t}" Value="${v}" />`).join('\n')}
</DoubleAnimationUsingKeyFrames>`;

const seg = (margin = '0,0,3,0') => `<Path Data="F1M3,0H12L9,8H0Z" Margin="${margin}" Fill="{DynamicResource SlotBorderBrush}" />`;

// Empty state: a codex panel waiting for a target. The mass relay (EmptyGameIcon) breathes inside targeting brackets
// while a scan line sweeps the panel, and a lit segment runs along a shield bar underneath. Plain properties only.
const empty = `<Grid VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
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
        <Grid Width="200" Height="168" HorizontalAlignment="Center">
            <Control Template="{DynamicResource ChamferTemplate}" Focusable="False" IsTabStop="False" Padding="14"
                     Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" />
            <Control Template="{DynamicResource CornerMarksTemplate}" Focusable="False" IsTabStop="False" Margin="22" Foreground="{DynamicResource HighlightGlyphBrush}" />
            <Canvas Width="64" Height="64" HorizontalAlignment="Center" VerticalAlignment="Center">
                <Path Data="{DynamicResource EmptyGameIcon}" Fill="{DynamicResource GlyphBrush}">
${indent(idle('Path', 'RelayPulse', fade([['0', 1], ['1.5', 0.55], ['3', 1]])), 20)}
                </Path>
            </Canvas>
            <Grid Margin="16,14" ClipToBounds="True" IsHitTestVisible="False">
                <Rectangle Height="1" VerticalAlignment="Top" Fill="{DynamicResource GlyphBrush}" Opacity="0.45">
${indent(idle('Rectangle', 'ScanSweep', `<ThicknessAnimationUsingKeyFrames Storyboard.TargetProperty="Margin" Duration="0:0:3">
    <LinearThicknessKeyFrame KeyTime="0:0:0" Value="0,0,0,0" />
    <LinearThicknessKeyFrame KeyTime="0:0:2.4" Value="0,138,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:3" Value="0,138,0,0" />
</ThicknessAnimationUsingKeyFrames>`), 20)}
                </Rectangle>
            </Grid>
            <Path Data="{DynamicResource IconAdd}" Width="9" Height="9" Stretch="Fill" Margin="0,8,8,0" HorizontalAlignment="Right" VerticalAlignment="Top"
                  Fill="{DynamicResource HeadingMarkerBrush}" IsHitTestVisible="False" />
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,18,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarge}" Foreground="{DynamicResource HeadingForegroundBrush}" />
        <Grid HorizontalAlignment="Center" Margin="0,14,0,0" Width="72" Height="8">
            <StackPanel Orientation="Horizontal">
                ${seg()}
                ${seg()}
                ${seg()}
                ${seg()}
                ${seg('0')}
            </StackPanel>
            <Path Data="F1M3,0H12L9,8H0Z" HorizontalAlignment="Left" Fill="{DynamicResource HeadingMarkerBrush}">
${indent(idle('Path', 'SegmentRun', `<ThicknessAnimationUsingKeyFrames Storyboard.TargetProperty="Margin" Duration="0:0:2">
    <DiscreteThicknessKeyFrame KeyTime="0:0:0" Value="0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:0.4" Value="15,0,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:0.8" Value="30,0,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:1.2" Value="45,0,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:1.6" Value="60,0,0,0" />
</ThicknessAnimationUsingKeyFrames>`), 16)}
            </Path>
        </Grid>
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
    Relay: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Banner (GameBannerHeight, 340) under an amber wash and scanlines; spacer x * 180 / 340 (28 with no banner); lime
    display title with Play 160x40 and More and Edit 40x40 icon squares; screenshots, description and notes left,
    the codex side panel (metadata) right.
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
${indent(bannerSpacer('x * 180 / 340', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,8,0,20">
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
                                <Grid>
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '16,14,16,16'), 36)}
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

const grid = `<!--
    Relay: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 140 / 340, actions under the title, text left and the codex side panel right. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 140 / 340', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,8,0,20">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,14,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid>
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '14,12,14,14'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ comment: '<!-- Close: a 28x28 plate that reads at rest (the amber button plate, a rim and a sand glyph) and turns Renegade red on hover. -->' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, grid);
