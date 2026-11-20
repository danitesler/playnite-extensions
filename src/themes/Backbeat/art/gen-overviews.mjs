// Generates Backbeat's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Backbeat/art/gen-overviews.mjs src/themes/Backbeat/src
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
  sideColumnWidth: '104',
  captionFontWeight: 'SemiBold',
};

// Section header: the word on a slanted sticker, then a hard rule ending in four beat ticks.
const header = (loc, marker, margin = '0,0,0,12') => `<DockPanel Margin="${margin}">
    <Grid DockPanel.Dock="Left">
        <Control Template="{DynamicResource SlantPlateTemplate}" Background="{DynamicResource ${marker}}"
                 BorderBrush="{DynamicResource PanelShadowBrush}" BorderThickness="2" Foreground="{DynamicResource PanelShadowBrush}" />
        <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="12,3,12,3" />
    </Grid>
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource HeadingRuleBrush}" Margin="12,0,0,0" VerticalAlignment="Center" />
</DockPanel>`;

// The metadata pane is a comic panel: tilted card, 3px white line, hard orange shadow, halftone in its corner.
// Groups sit in a clipping wrapper pulled up by 2 x 12 + 2 + 7 = 33 (first rule hidden) and down by 7.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Control Template="{DynamicResource AngledCardTemplate}" Background="{DynamicResource ExpanderBackgroundBrush}"
             BorderBrush="{DynamicResource FrameBrush}" BorderThickness="3" Foreground="{DynamicResource TitleSuffixBrush}" />
    <Control Template="{DynamicResource HalftoneTemplate}" Foreground="{DynamicResource HeadingMarkerBrush}"
             Width="180" Height="100" Margin="0,5,5,0" HorizontalAlignment="Right" VerticalAlignment="Top" Opacity="0.6" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
${indent(header('LOCGameDetails', 'TitleSuffixBrush', '0,0,0,4'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-7">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, { borderThickness: '0,2,0,0', fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
}

// No OpacityMask on the art: the Play star animates over this area. The fade is a plain gradient to the page color.
// The halftone patch stays in the top 30% of the banner, clear of the Play star at any banner height.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.12" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Width="420" HorizontalAlignment="Right" VerticalAlignment="Top" Opacity="0.85" Fill="{DynamicResource HeadingMarkerAltBrush}"
               Height="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='x * 0.3'}">
        <Rectangle.OpacityMask>
            <ImageBrush ImageSource="{ThemeFile 'Images/fx/halftone-wide.png'}" Stretch="Fill" />
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

// The slanted panel cut under the header. It sits in the content flow so it can never run behind the text columns.
const panelCut = `<Path Data="M0,100 L100,0" Stretch="Fill" Height="14" Stroke="{DynamicResource FrameBrush}" StrokeThickness="3" IsHitTestVisible="False" />`;

// The title is headline italics over a hard ink copy offset 3px. The copy is bound to the real title, so it empties with it.
const titleStyle = `FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontStyle="Italic" TextWrapping="Wrap"`;
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" Margin="0,0,12,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Grid VerticalAlignment="Center">
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" ${titleStyle} Foreground="{DynamicResource TextOutlineBrush}" Margin="3,3,0,0" IsHitTestVisible="False" />
        <TextBlock x:Name="PART_TextDisplayName" ${titleStyle} Foreground="{DynamicResource TextBrush}" Margin="0,0,3,3" />
    </Grid>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="150" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  borderBrush: 'WindowPanelSeparatorBrush',
  borderThickness: '2',
  skeletonContent: `<Grid x:Name="SkeletonCells" Margin="8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="8" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" />
    <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" />
</Grid>`,
});

const textColumn = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle', 'HeadingMarkerAltBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource PropertyItemForegroundBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(header('LOCNotesLabel', 'HeadingMarkerBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;

// A loop that runs only while no game is selected. Opacity only: Playnite builds this page with no game bound,
// so a transform animated from a Style trigger would crash it.
const beatDot = (name, begin) => `<Ellipse Width="16" Height="16" Margin="5,0" Fill="{DynamicResource TextBrushDark}">
    <Ellipse.Style>
        <Style TargetType="Ellipse">
            <Setter Property="Opacity" Value="0.25" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                    <DataTrigger.EnterActions>
                        <BeginStoryboard x:Name="${name}">
                            <Storyboard RepeatBehavior="Forever">
                                <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity" BeginTime="${begin}" Duration="0:0:1.38" RepeatBehavior="Forever">
                                    <LinearDoubleKeyFrame KeyTime="0:0:0" Value="1" />
                                    <LinearDoubleKeyFrame KeyTime="0:0:0.34" Value="0.25" />
                                    <LinearDoubleKeyFrame KeyTime="0:0:1.38" Value="0.25" />
                                </DoubleAnimationUsingKeyFrames>
                            </Storyboard>
                        </BeginStoryboard>
                    </DataTrigger.EnterActions>
                    <DataTrigger.ExitActions>
                        <RemoveStoryboard BeginStoryboardName="${name}" />
                    </DataTrigger.ExitActions>
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Ellipse.Style>
</Ellipse>`;

// Empty state: a blank speech balloon on a jagged star, three dots pulsing on the beat (0.46s apart).
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
        <Grid Width="220" Height="170" HorizontalAlignment="Center">
            <Path Data="{DynamicResource IconBurst}" Stretch="Fill" Fill="{DynamicResource HeadingMarkerBrush}" Stroke="{DynamicResource PanelShadowBrush}" StrokeThickness="3" />
            <Path Data="M34,44 L190,36 200,112 116,120 86,150 92,122 26,126Z" Fill="{DynamicResource PanelShadowBrush}" Margin="6,6,0,0" />
            <Path Data="M34,44 L190,36 200,112 116,120 86,150 92,122 26,126Z" Fill="{DynamicResource TextBrush}" Stroke="{DynamicResource PanelShadowBrush}" StrokeThickness="4" />
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Top" Margin="0,72,8,0">
${indent(beatDot('BeatA', '0:0:0'), 16)}
${indent(beatDot('BeatB', '0:0:0.46'), 16)}
${indent(beatDot('BeatC', '0:0:0.92'), 16)}
            </StackPanel>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,22,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontStyle="Italic" FontSize="{DynamicResource FontSizeLarger}"
                   Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</Grid>`;

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="28" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;

const details = `<!--
    Backbeat: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 340), halftone in its top-right corner;
    spacer x * 150 / 340 (28 with no banner); headline title over a hard ink copy with the actions (Play 150x40, More and Edit
    40x40 icon squares with tooltips, always visible); a slanted white panel cut; screenshots, description and notes on the
    left and the comic-panel metadata card on the right (GameDetailsPaneWidth, 300). Structure: Playnite Default 10.60.
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
                            <StackPanel Margin="30,0,34,34">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 150 / 340', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,12,0,16">
${indent(actions('16,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
${indent(panelCut, 32)}
                                <Grid Margin="0,16,0,0">
${indent(columns, 36)}
${indent(textColumn, 36)}
${indent(pane('side', 'GameDetailsPaneWidth', '18,16,18,18').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Backbeat: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 120 / 340 (52 with no banner, room for the close button),
    headline title, actions under it, then text left and the comic-panel metadata card right (GridDetailsPaneWidth, 300 content
    width). Close (CloseGameSideBarCommand) sits before the game icon below 120px banner height, otherwise at the top-left corner. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource FrameBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="3,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,3,0" />
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
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,30,30">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 120 / 340', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${indent(gridTitle, 44)}
${indent(actions('0,14,0,0'), 44)}
                                        </StackPanel>
${indent(panelCut, 40)}
                                        <Grid Margin="0,16,0,0">
${indent(columns, 44)}
${indent(textColumn, 44)}
${indent(pane('stack', 'GridDetailsPaneWidth', '16,14,16,16').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
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
