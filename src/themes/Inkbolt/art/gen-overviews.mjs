// Generates Inkbolt's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Inkbolt/art/gen-overviews.mjs src/themes/Inkbolt/src
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

// PlayTime is promoted into the metadata header band, so MetaProgress drops it here.
const groups = META_GROUPS.map(([g, fields]) => [
  g,
  g === 'MetaProgress' ? fields.filter(([name]) => name !== 'PlayTime') : fields,
]);

const fieldOptions = {
  margin: '0,6',
  captionFontFamily: 'HeadingFontFamily',
  captionFontWeight: 'SemiBold',
  captionFontSize: 'FontSize',
  captionMargin: '0,1,0,0',
};

// Section header: the source's grey section tab (POWER LEVEL 1): a band with black caps in the heading face. Every part takes its width from its host.
const header = (loc, margin = '0,0,0,14') => `<Border Margin="${margin}" MinHeight="24" Background="{DynamicResource HeaderBandBrush}">
    <TextBlock Margin="12,2,12,3" Style="{DynamicResource HeadingTextBlock}" FontWeight="SemiBold" Foreground="{DynamicResource HeaderBandForegroundBrush}" TextTrimming="CharacterEllipsis">
        <ContentPresenter Content="{DynamicResource ${loc}}">
            <ContentPresenter.Resources>
                <DataTemplate DataType="{x:Type sys:String}">
                    <AccessText Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" />
                </DataTemplate>
            </ContentPresenter.Resources>
        </ContentPresenter>
    </TextBlock>
</Border>`;

// The metadata pane: the source's detail panel. A charcoal body in a single ash hairline, headed by the grey band that carries the play time
// (the "1403 | AVAILABLE XP" header: value left, caption right). The band is PART_ElemPlayTime itself, so Playnite's visibility toggle hides it.
// Groups sit in a clipping wrapper whose panel is pulled up by 2 x 12 + 1 + 6 = 31 (first rule hidden) and down by 6.
function pane(layout, widthKey, padding) {
  const [pl, , pr] = padding.split(',');
  return `<Grid VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}">
        <StackPanel>
            <Border x:Name="PART_ElemPlayTime" Background="{DynamicResource HeaderBandBrush}" Padding="${pl},8,${pr},8" MinHeight="46">
                <Grid>
                    <TextBlock x:Name="PART_TextPlayTime" HorizontalAlignment="Left" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}"
                               FontWeight="Bold" FontSize="26" Foreground="{DynamicResource HeaderBandForegroundBrush}" />
                    <TextBlock Text="{DynamicResource LOCTimePlayed}" HorizontalAlignment="Right" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}"
                               FontWeight="SemiBold" FontSize="{DynamicResource FontSizeSmall}" Foreground="{DynamicResource HeaderBandForegroundBrush}" Margin="12,0,0,0" />
                </Grid>
            </Border>
            <Border Padding="${padding}">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-31,0,-6">
${indent(groups.map(g => metadataGroup(g, layout, { fieldOptions })).join('\n'), 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </StackPanel>
    </Border>
    <Control Template="{DynamicResource FramedPlateTemplate}" Foreground="{DynamicResource FrameBrush}" BorderBrush="{DynamicResource GlyphBrush}" Focusable="False" />
</Grid>`;
}

// No OpacityMask on the banner: masked art repainted in part behind the animated Play button leaves dark seams on scaled
// displays. The fade is a plain gradient to the page color; a second gradient darkens the head. No wash: the source shows its art clean.
// The cobalt corner ribbon is page decor, not banner: it sits outside HeroArt, so it survives window-art mode and a banner height of 0.
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

const ribbon = (size) => `<Control Template="{DynamicResource RibbonCornerTemplate}" Foreground="{DynamicResource StripeBrush}" Opacity="0.55" Width="${size}" Height="${size}"
         HorizontalAlignment="Right" VerticalAlignment="Top" Focusable="False" IsHitTestVisible="False" />`;

// Title: the source's mission toast. The game name in the heading face, uppercase (Playnite's StringToUpperCaseConverter on a
// copy bound to the real part), near-white over a hard 2px black copy (no blurred shadow: DropShadowEffect is not used in this repo).
// PART_TextDisplayName keeps its place in the layout but is drawn transparent; the copies vanish when it is empty.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Grid VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="Transparent" TextWrapping="Wrap" />
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource TextShadowBrush}" TextWrapping="Wrap" Margin="2,2,-2,-2" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource SelectedBrush}" TextWrapping="Wrap" IsHitTestVisible="False">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
    </Grid>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="204" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="12,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  extraAfterControl: `<Control Template="{DynamicResource InkFrameTemplate}" Foreground="{DynamicResource HoverBrush}" Margin="-6,-6,-6,14" VerticalAlignment="Stretch" Focusable="False" IsHitTestVisible="False"
         Visibility="{Binding Visibility, ElementName=SteamScreenshots_SteamScreenshotsViewControl}" />`,
});

const textColumn = `<StackPanel>
${indent(steam, 4)}
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
        <DiscreteDoubleKeyFrame KeyTime="0:0:0" Value="1" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.09" Value="0.3" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.18" Value="1" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.27" Value="0.55" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.36" Value="1" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:1.8" Value="1" />
    </DoubleAnimationUsingKeyFrames>
</Storyboard>`;

// Empty state: the source's loading screen. Ink black page, the theme's mark (a broken ring around a bolt), the tip line in capitals and the
// two-tone loading bar (lightning-blue progress over the evil-karma red remainder) with a lightning trace that flickers on its edge. The ink
// splatter sits at the foot and the cobalt ribbon crosses the top-right corner. The flicker is an Opacity loop in the trace's own Style (Opacity only:
// never animate a RenderTransform from a Style trigger here, the template is built with no game yet and Playnite crashes). Centered in the visible area.
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
    <Control Template="{DynamicResource SplatterTemplate}" Foreground="{DynamicResource NormalBrush}" Opacity="0.5" Width="360" Height="360"
             HorizontalAlignment="Left" VerticalAlignment="Bottom" Margin="-80,0,0,-60" Focusable="False" IsHitTestVisible="False" />
    <Control Template="{DynamicResource RibbonCornerTemplate}" Foreground="{DynamicResource StripeDeepBrush}" Opacity="0.9" Width="300" Height="300"
             HorizontalAlignment="Right" VerticalAlignment="Top" Focusable="False" IsHitTestVisible="False" />
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,40">
        <Control Template="{DynamicResource BrandMarkTemplate}" Foreground="{DynamicResource SelectedBrush}" Width="96" Height="96" HorizontalAlignment="Center" Focusable="False" IsHitTestVisible="False">
            <Control.Style>
                <Style TargetType="Control">
                    <Style.Triggers>
                        <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                            <DataTrigger.EnterActions>
                                <BeginStoryboard x:Name="MarkFloat">
                                    <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                        <ThicknessAnimation Storyboard.TargetProperty="Margin" From="0,-4,0,4" To="0,4,0,-4" Duration="0:0:3.6">
                                            <ThicknessAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></ThicknessAnimation.EasingFunction>
                                        </ThicknessAnimation>
                                        <DoubleAnimation Storyboard.TargetProperty="Opacity" From="1" To="0.72" Duration="0:0:3.6">
                                            <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
                                        </DoubleAnimation>
                                    </Storyboard>
                                </BeginStoryboard>
                            </DataTrigger.EnterActions>
                            <DataTrigger.ExitActions>
                                <RemoveStoryboard BeginStoryboardName="MarkFloat" />
                            </DataTrigger.ExitActions>
                        </DataTrigger>
                    </Style.Triggers>
                </Style>
            </Control.Style>
        </Control>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,16,0,0" Style="{DynamicResource HeadingTextBlock}"
                   FontWeight="SemiBold" FontSize="{DynamicResource FontSizeLarger}" />
        <Grid Width="260" Height="28" Margin="0,10,0,0" HorizontalAlignment="Center" IsHitTestVisible="False">
            <Grid Height="4" VerticalAlignment="Bottom">
                <Rectangle Fill="{DynamicResource ProgressBarTrackBrush}" />
                <Rectangle Width="57" HorizontalAlignment="Left" Fill="{DynamicResource GlyphBrush}" />
            </Grid>
            <Control Template="{DynamicResource ArcStripTemplate}" Foreground="{DynamicResource PrimaryButtonGlowBrush}" Width="96" HorizontalAlignment="Left" VerticalAlignment="Bottom" Margin="0,0,0,-12" Focusable="False">
${indent(whenEmpty('Control', 'TraceFlicker', flicker), 16)}
            </Control>
        </Grid>
    </StackPanel>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const details = `<!--
    Inkbolt: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 260) shown clean, darkened at its
    head and faded into the page, the cobalt corner ribbon over it as page decor; spacer x * 128 / 260 (28 with no
    banner); the game name as the mission toast (heading face, uppercase, near-white over a hard 2px black copy), the
    actions beside it (Play slab 204x40, More and Edit 40x40 icon squares with tooltips, always visible); then the
    screenshots in one ink frame, description and notes under grey section bands on the left and the detail panel on
    the right (GameDetailsPaneWidth, 300 content width) headed by the play-time band.
    Empty state: the loading screen (mark, tip line, two-tone bar). Structure: Playnite Default 10.60.
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
${indent(ribbon(240), 28)}
                            <StackPanel Margin="30,0,30,30">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 128 / 260', 20, 'DetailsBannerSpacer'), 32)}
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
${indent(pane('side', 'GameDetailsPaneWidth', '16,10,16,16').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Inkbolt: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 100 / 260 (14 floor), the mission toast,
    actions under it, then text left and the detail panel right (GridDetailsPaneWidth, 300 content width) with
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
${indent(ribbon(180), 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 100 / 260', 14, 'GridBannerSpacer'), 40)}
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
${indent(pane('stack', 'GridDetailsPaneWidth', '16,10,16,16').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
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
