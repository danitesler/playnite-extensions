// Generates Cloudbank's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Cloudbank/art/gen-overviews.mjs src/themes/Cloudbank/src
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

const fieldOptions = {
  margin: '0,8',
  sideColumnWidth: '104',
  captionFontFamily: 'HeadingFontFamily',
  captionFontWeight: 'SemiBold',
};

// Section header: marker bar, heading, rule with circuit stub.
const header = (loc, marker, margin = '0,0,0,12') => `<DockPanel Margin="${margin}">
    <Rectangle DockPanel.Dock="Left" Width="4" Height="14" Margin="0,0,8,0" VerticalAlignment="Center" Fill="{DynamicResource ${marker}}" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" />
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource HeadingRuleBrush}" Margin="12,0,0,0" VerticalAlignment="Center" />
</DockPanel>`;

// The metadata pane: a Functions-screen DETAILS panel: lit circuit edge, a second line 3px inside at 25% (the
// game's multi-line circuit bus) and the panel bloom (GlowFrameTemplate, host at -32).
// Groups sit in a clipping wrapper whose panel is pulled up by 2 x 12 + 1 + 8 = 33 (first rule hidden) and down by 8.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Control Template="{DynamicResource GlowFrameTemplate}" Foreground="{DynamicResource FrameBrush}" Margin="-32" Opacity="0.85" />
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
${indent(header('LOCGameDetails', 'HeadingMarkerAltBrush', '0,0,0,4'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-8">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, { fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Border Margin="3" BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1" IsHitTestVisible="False" />
</Grid>`;
}

const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Border Background="{DynamicResource ArtTintBrush}" Opacity="0.35" />
    <!-- No OpacityMask on the banner: masked art repainted in part (behind the animated Play button) left dark
         seams on scaled displays. The fade is a plain gradient to the page color, read from the page brush. -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.25" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

// Title with the game's function-name suffix: "Name" then a mint "()". WrapPanel passes its width down, so long
// names still wrap and the suffix follows the last word.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" Margin="0,0,12,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <WrapPanel VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                   FontWeight="Bold" Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />
        <TextBlock Text="()" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                   FontWeight="Bold" Foreground="{DynamicResource TitleSuffixBrush}" Margin="2,0,0,0">
${indent(hideWhenNoTitle('TextBlock'), 12)}
        </TextBlock>
    </WrapPanel>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="150" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  borderBrush: 'WindowPanelSeparatorBrush',
  skeletonContent: `<Grid x:Name="SkeletonCells" Margin="8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="8" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" />
    <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" />
</Grid>`,
});

const textColumn = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle', 'HeadingMarkerAltBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrushDarker}" Tag="{DynamicResource GlyphBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(header('LOCNotesLabel', 'HeadingMarkerBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrushDarker}" />
    </StackPanel>
</StackPanel>`;

// Empty state (no game selected): an empty upgrade-slot hexagon in the selection brackets with a pulsing diamond pip,
// Playnite's "No game selected", and a standby scan along a row of memory pips. Centered in the visible area; the
// loops run only while it shows (RemoveStoryboard on exit).
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
        <Grid Width="96" Height="84" HorizontalAlignment="Center">
            <Control Template="{DynamicResource CornerMarksTemplate}" Foreground="{DynamicResource SelectedBorderBrush}" Margin="-12" />
            <Path Data="M24.75,0.75 L71.25,0.75 95.25,42 71.25,83.25 24.75,83.25 0.75,42Z" Fill="{DynamicResource ButtonBackgroundBrush}"
                  Stroke="{DynamicResource ButtonBorderBrush}" StrokeThickness="1.5" />
            <Path Data="M30,10 L66,10 85,42 66,74 30,74 11,42Z" Stroke="{DynamicResource FrameInnerBrush}" StrokeThickness="1" />
            <Path Data="M48,28 L62,42 48,56 34,42Z" Fill="{DynamicResource GlyphBrush}">
                <Path.Style>
                    <Style TargetType="Path">
                        <Style.Triggers>
                            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                <DataTrigger.EnterActions>
                                    <BeginStoryboard x:Name="PipPulse">
                                        <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                            <DoubleAnimation Storyboard.TargetProperty="Opacity" From="1" To="0.3" Duration="0:0:1.6">
                                                <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
                                            </DoubleAnimation>
                                        </Storyboard>
                                    </BeginStoryboard>
                                </DataTrigger.EnterActions>
                                <DataTrigger.ExitActions>
                                    <RemoveStoryboard BeginStoryboardName="PipPulse" />
                                </DataTrigger.ExitActions>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Path.Style>
            </Path>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,24,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarge}" FontWeight="SemiBold"
                   Foreground="{DynamicResource TextBrushDarker}" />
        <Grid HorizontalAlignment="Center" Margin="0,14,0,0" Width="100" Height="4">
            <StackPanel Orientation="Horizontal">
                <Rectangle Width="10" Height="4" Margin="0,0,5,0" Fill="{DynamicResource NormalBorderBrush}" />
                <Rectangle Width="10" Height="4" Margin="0,0,5,0" Fill="{DynamicResource NormalBorderBrush}" />
                <Rectangle Width="10" Height="4" Margin="0,0,5,0" Fill="{DynamicResource NormalBorderBrush}" />
                <Rectangle Width="10" Height="4" Margin="0,0,5,0" Fill="{DynamicResource NormalBorderBrush}" />
                <Rectangle Width="10" Height="4" Margin="0,0,5,0" Fill="{DynamicResource NormalBorderBrush}" />
                <Rectangle Width="10" Height="4" Margin="0,0,5,0" Fill="{DynamicResource NormalBorderBrush}" />
                <Rectangle Width="10" Height="4" Fill="{DynamicResource NormalBorderBrush}" />
            </StackPanel>
            <Rectangle Width="10" Height="4" HorizontalAlignment="Left" Fill="{DynamicResource GlyphBrush}">
                <Rectangle.Style>
                    <Style TargetType="Rectangle">
                        <Style.Triggers>
                            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                <DataTrigger.EnterActions>
                                    <BeginStoryboard x:Name="PipScan">
                                        <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                            <ThicknessAnimation Storyboard.TargetProperty="Margin" From="0" To="90,0,0,0" Duration="0:0:1.2">
                                                <ThicknessAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></ThicknessAnimation.EasingFunction>
                                            </ThicknessAnimation>
                                        </Storyboard>
                                    </BeginStoryboard>
                                </DataTrigger.EnterActions>
                                <DataTrigger.ExitActions>
                                    <RemoveStoryboard BeginStoryboardName="PipScan" />
                                </DataTrigger.ExitActions>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Rectangle.Style>
            </Rectangle>
        </Grid>
    </StackPanel>
</Grid>`;

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const details = `<!--
    Cloudbank: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 340) under a cell-colored wash and a
    page scrim; spacer x * 150 / 340 (28 with no banner); title with the mint "()" function suffix and the actions
    (Play 150x40, More and Edit 40x40 icon squares with tooltips, always visible); then screenshots,
    description and notes on the left and the DETAILS panel on the right (GameDetailsPaneWidth, 300).
    Section headers: 4x14 marker bar, heading font, hairline rule with a circuit stub (DividerTemplate).
    Metadata: every field in six collapsing groups, caption column 104 beside the value. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(heroArt, 28)}
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 150 / 340', 16, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,12,0,16">
${indent(actions('16,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
                                <Grid Margin="0,22,0,0">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="24" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${indent(textColumn, 36)}
${indent(pane('side', 'GameDetailsPaneWidth', '16,14,16,16').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Cloudbank: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 120 / 340 (52 with no banner, room for the close
    button), title with the "()" suffix, actions under it, then text left and the DETAILS panel right
    (GridDetailsPaneWidth, 300 content width) with captions beside values. Close (CloseGameSideBarCommand) sits before the game icon below 120px banner height, otherwise at the top-left corner.
    1px frame line on the side facing the grid. Structure: Playnite Default 10.60.
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
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 120 / 340', 12, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${indent(gridTitle, 44)}
${indent(actions('0,14,0,0'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,20,0,0">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="24" />
                                                <ColumnDefinition Width="Auto" />
                                            </Grid.ColumnDefinitions>
${indent(textColumn, 44)}
${indent(pane('stack', 'GridDetailsPaneWidth', '14,12,14,14').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
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
