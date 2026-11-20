// Generates Glyphbit's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Glyphbit/art/gen-overviews.mjs
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

// The metadata pane: a thin neon frame on black, a rune column inside its top-left corner and a white pip on the top right.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="2" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-8">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Grid ClipToBounds="True" IsHitTestVisible="False">
        <Canvas Margin="6,6,0,0" HorizontalAlignment="Left" VerticalAlignment="Top">
            <Path Data="{DynamicResource IconGlyphColumn}" Fill="{DynamicResource GlyphBrush}" />
        </Canvas>
    </Grid>
    <Rectangle Width="6" Height="6" HorizontalAlignment="Right" VerticalAlignment="Top" Fill="{DynamicResource TextBrush}" IsHitTestVisible="False" />
</Grid>`;

// Banner: art under a violet wash and scanlines, a plain gradient to the page color, and a ragged pixel edge.
// No OpacityMask: the banner sits behind the animated Play button.
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Border Background="{DynamicResource ArtTintBrush}" Opacity="0.22" />
    <Canvas HorizontalAlignment="Left" VerticalAlignment="Top" Opacity="0.3">
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
    <Canvas HorizontalAlignment="Left" VerticalAlignment="Bottom" Height="40">
        <Path Data="{DynamicResource IconCrumbleEdge}" Fill="{Binding Background, ElementName=PageRoot}" />
    </Canvas>
</Grid>`;

const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="32" MaxHeight="32" Margin="0,0,12,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               FontWeight="SemiBold" Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" VerticalAlignment="Center" />
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
  backgroundBrush: 'NormalBrush',
  skeletonContent: '<Control Template="{DynamicResource CornerMarksTemplate}" Focusable="False" IsTabStop="False" Margin="24" Foreground="{DynamicResource SlotBorderBrush}" />',
});

// Description and notes carry no words above them, only a short stepped ramp: the page says as little as it can.
const ramp = `<Control Template="{DynamicResource PixelRampTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Width="96" Height="4" HorizontalAlignment="Left" Margin="0,0,0,12"
         Background="{DynamicResource HeadingMarkerBrush}" Foreground="{DynamicResource GlyphBrush}" />`;

const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(ramp, 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrushDarker}" Tag="{DynamicResource GlyphBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(ramp, 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrushDarker}" />
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

const blink = (times) => `<DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity" Duration="0:0:3">
${times.map(([t, v]) => `    <DiscreteDoubleKeyFrame KeyTime="0:0:${t}" Value="${v}" />`).join('\n')}
</DoubleAnimationUsingKeyFrames>`;

const spark = (name, margin, times) => `<Path Data="F1M2,0h2v2h2v2h-2v2h-2v-2h-2v-2h2z" Fill="{DynamicResource HeadingMarkerBrush}" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="${margin}" Opacity="0">
${indent(idle('Path', name, blink(times)), 4)}
</Path>`;

const pip = (margin = '0,0,4,0') => `<Rectangle Width="10" Height="10" Margin="${margin}" Fill="{DynamicResource SlotBorderBrush}" />`;

// Empty state: the inventory's empty slot, brackets and all, holding a stepped-diamond module that pulses in hard frames,
// with mint sparks around it and the HUD's pip row scanning underneath.
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
        <Grid Width="168" Height="168" HorizontalAlignment="Center">
            <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1" />
            <Control Template="{DynamicResource CornerMarksTemplate}" Focusable="False" IsTabStop="False" Margin="16" Foreground="{DynamicResource FrameInnerBrush}" />
            <Canvas Width="64" Height="64" HorizontalAlignment="Center" VerticalAlignment="Center">
                <Path Data="{DynamicResource EmptyGameIcon}" Fill="{DynamicResource GlyphBrush}">
${indent(idle('Path', 'ModulePulse', blink([['0', 1], ['1.8', 0.6], ['2.1', 0.8], ['2.4', 0.6], ['2.7', 0.8]])), 20)}
                </Path>
            </Canvas>
${indent(spark('SparkA', '30,34,0,0', [['0.4', 1], ['0.7', 0.4], ['1', 0]]), 12)}
${indent(spark('SparkB', '136,52,0,0', [['1.3', 1], ['1.6', 0.4], ['1.9', 0]]), 12)}
${indent(spark('SparkC', '48,134,0,0', [['2.2', 1], ['2.5', 0.4], ['2.8', 0]]), 12)}
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,18,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarge}" Foreground="{DynamicResource TextBrushDarker}" />
        <Grid HorizontalAlignment="Center" Margin="0,14,0,0" Width="66" Height="10">
            <StackPanel Orientation="Horizontal">
                ${pip()}
                ${pip()}
                ${pip()}
                ${pip()}
                ${pip('0')}
            </StackPanel>
            <Rectangle Width="10" Height="10" HorizontalAlignment="Left" Fill="{DynamicResource HeadingMarkerBrush}">
${indent(idle('Rectangle', 'PipScan', `<ThicknessAnimationUsingKeyFrames Storyboard.TargetProperty="Margin" Duration="0:0:2">
    <DiscreteThicknessKeyFrame KeyTime="0:0:0" Value="0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:0.4" Value="14,0,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:0.8" Value="28,0,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:1.2" Value="42,0,0,0" />
    <DiscreteThicknessKeyFrame KeyTime="0:0:1.6" Value="56,0,0,0" />
</ThicknessAnimationUsingKeyFrames>`), 16)}
            </Rectangle>
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
    Glyphbit: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Banner (GameBannerHeight, 320) with scanlines and a ragged pixel edge; spacer x * 170 / 320 (28 with no banner); title
    with Play 160x40 and More and Edit 40x40 icon squares; screenshots, description and notes left, metadata frame right.
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
${indent(bannerSpacer('x * 170 / 320', 20, 'DetailsBannerSpacer'), 32)}
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
    Glyphbit: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 130 / 320 (52 with no banner, room for the close button), actions under the title,
    text left and the metadata frame right. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 130 / 320', 14, 'GridBannerSpacer'), 40)}
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
${indent(sidePanelCloseButton({ preset: 'plate' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, grid);
