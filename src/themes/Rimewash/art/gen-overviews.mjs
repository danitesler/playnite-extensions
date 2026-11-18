// Generates Rimewash's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Rimewash/art/gen-overviews.mjs src/themes/Rimewash/src
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  indent,
  inlineCloseButton,
  metadataGroup,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);

const fieldOptions = {
  margin: '0,6',
  sideColumnWidth: '104',
  captionFontSize: 'FontSizeSmall',
};

// A section header: the serif title and the dotted pencil rule running to the right (the game's screen titles).
const header = (loc, margin = '0,0,0,12') => `<DockPanel Margin="${margin}">
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" />
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource HeadingRuleBrush}" Margin="14,0,0,3" VerticalAlignment="Bottom" />
</DockPanel>`;

// Numeric values print in the game's orange (ValueAccentBrush): play time and install size.
const orange = (xaml) => xaml
  .replace(/(x:Name="PART_TextPlayTime"[^>]*?)Foreground="\{DynamicResource TextBrush\}"/g, '$1Foreground="{DynamicResource ValueAccentBrush}" FontWeight="Medium"')
  .replace(/(x:Name="PART_TextInstallSize"[^>]*?)Foreground="\{DynamicResource TextBrush\}"/g, '$1Foreground="{DynamicResource ValueAccentBrush}" FontWeight="Medium"');

// The metadata pane: the game's inventory card. A snow plate on a soft shadow, six groups in a clipping wrapper whose panel is
// pulled up by 12 + 12 + 1 + 6 = 31 (the first rule hidden) and down by 6.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Control Template="{DynamicResource SnowShadowTemplate}" Foreground="{DynamicResource PanelShadowBrush}" Margin="-14,-4,-14,-20" Opacity="0.34" />
    <Control Template="{DynamicResource SnowPlateTemplate}" Background="{DynamicResource InputBackgroundBrush}" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-31,0,-6">
${indent(orange(META_GROUPS.map(g => metadataGroup(g, layout, { fieldOptions })).join('\n')), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
}

// The sheet: a torn snow plate behind the whole page on a soft shadow. It goes away while Playnite draws game art behind the
// window (the pages are see-through then). SheetSwatch holds the colour the banner fades into.
const sheet = (margin) => `<Border x:Name="SheetSwatch" Background="{DynamicResource GameOverviewBackgroundBrush}" Visibility="Collapsed" />
<Grid x:Name="SheetLayer" Margin="${margin}" IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Control Template="{DynamicResource SnowShadowTemplate}" Foreground="{DynamicResource PanelShadowBrush}" Margin="-14,-4,-14,-20" Opacity="0.4" />
    <Control Template="{DynamicResource SnowPlateTemplate}" Background="{DynamicResource GameOverviewBackgroundBrush}" />
</Grid>`;

const pageRoot = `<Grid.Style>
    <Style TargetType="Grid">
        <Setter Property="Background" Value="Transparent" />
        <Style.Triggers>
            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                <Setter Property="Background" Value="Transparent" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</Grid.Style>`;

// The banner: art inside the sheet with rounded top corners and a fade that is complete by the title row, so the title (ink)
// always sits on the sheet colour. fadeFrom / fadeTo are fractions of the banner height; the spacer under it uses the same
// proportions, so the relationship holds at every banner height. Corners are two small sheet-coloured cut-outs drawn over the art
// (no OpacityMask on the banner, repo rule); the sheet is a flat colour, so they are seamless. The fade starts from a literal
// transparent frost (#00F0F3F5) because a transparent black start would pass through grey on its way to the sheet.
const heroArt = (margin, fadeFrom, fadeTo, radius = 14) => `<Grid x:Name="HeroArt" VerticalAlignment="Top" Margin="${margin}" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Margin="-1,0,-1,-1">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00F0F3F5" Offset="${fadeFrom}" />
                <GradientStop Color="#B8F0F3F5" Offset="${(fadeFrom + (fadeTo - fadeFrom) * 0.55).toFixed(3)}" />
                <GradientStop Color="{Binding Background.Color, ElementName=SheetSwatch, FallbackValue=#FFF0F3F5}" Offset="${fadeTo}" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Path Data="M0,0 L${radius},0 A${radius},${radius} 0 0 0 0,${radius} Z" Fill="{DynamicResource GameOverviewBackgroundBrush}"
          HorizontalAlignment="Left" VerticalAlignment="Top" Width="${radius}" Height="${radius}" />
    <Path Data="M0,0 L${radius},0 L${radius},${radius} A${radius},${radius} 0 0 0 0,0 Z" Fill="{DynamicResource GameOverviewBackgroundBrush}"
          HorizontalAlignment="Right" VerticalAlignment="Top" Width="${radius}" Height="${radius}" />
</Grid>`;

const titleText = `<TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
           FontWeight="Normal" TextWrapping="Wrap" VerticalAlignment="Center">
    <TextBlock.Style>
        <Style TargetType="TextBlock">
            <Setter Property="Foreground" Value="{DynamicResource HeadingForegroundBrush}" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </TextBlock.Style>
</TextBlock>`;

const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
${indent(titleText, 4)}
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid MinWidth="150" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Width="18" Height="18" Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Width="18" Height="18" Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  margin: '0,0,0,20',
  borderBrush: 'WindowPanelSeparatorBrush',
  skeletonContent: `<Grid x:Name="SkeletonCells" Margin="8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="10" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource CornerRadiusSmall}" />
    <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource CornerRadiusSmall}" />
</Grid>`,
});

// Description and notes: text on the sheet is ink; while game art is behind the window (no sheet) it reads in the lightest ink.
const bodyText = (name, extra) => `<HtmlTextView x:Name="${name}" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
              HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
              LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}"${extra}>
    <HtmlTextView.Style>
        <Style TargetType="HtmlTextView">
            <Setter Property="TextElement.Foreground" Value="{DynamicResource ParchmentTextBrush}" />
            <Setter Property="Tag" Value="{DynamicResource LinkBrush}" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="TextElement.Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                    <Setter Property="Tag" Value="{DynamicResource WindowArtForegroundBrush}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </HtmlTextView.Style>
</HtmlTextView>`;

const textColumn = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(header('LOCGameDescriptionTitle'), 8)}
${indent(bodyText('PART_HtmlDescription', ''), 8)}
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,26,0,0">
        <StackPanel.Style>
            <Style TargetType="StackPanel">
                <Setter Property="TextElement.Foreground" Value="{DynamicResource ParchmentTextBrush}" />
                <Style.Triggers>
                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                        <Setter Property="TextElement.Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </StackPanel.Style>
${indent(header('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}"
                 Foreground="{Binding Path=(TextElement.Foreground), RelativeSource={RelativeSource AncestorType=StackPanel}}" />
    </StackPanel>
</StackPanel>`;

// Empty state (no game selected): the mark breathing over a soft disc, Playnite's "No game selected" in the serif of the screen
// titles under a pencil rule, and pencil roots in the corner. Centered in the visible area; the loop runs only while it shows
// (RemoveStoryboard on exit) and animates Opacity only.
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
    <Control Template="{DynamicResource RootsTemplate}" Width="120" Height="260" HorizontalAlignment="Right" VerticalAlignment="Bottom"
             Margin="0,0,30,30" Foreground="{DynamicResource TextBrush}" Opacity="0.2" />
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,36">
        <Grid Width="116" Height="116" HorizontalAlignment="Center">
            <Control Template="{DynamicResource BlobTemplate}" Foreground="{DynamicResource PropertyItemBackgroundBrush}" Opacity="0.9" />
            <Control Template="{DynamicResource BrandMarkTemplate}" Width="72" Height="72" Foreground="{DynamicResource HighlightGlyphBrush}">
                <Control.Style>
                    <Style TargetType="Control">
                        <Style.Triggers>
                            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                <DataTrigger.EnterActions>
                                    <BeginStoryboard x:Name="MarkBreath">
                                        <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                            <DoubleAnimation Storyboard.TargetProperty="Opacity" From="1" To="0.45" Duration="0:0:2.4">
                                                <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
                                            </DoubleAnimation>
                                        </Storyboard>
                                    </BeginStoryboard>
                                </DataTrigger.EnterActions>
                                <DataTrigger.ExitActions>
                                    <RemoveStoryboard BeginStoryboardName="MarkBreath" />
                                </DataTrigger.ExitActions>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Control.Style>
            </Control>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,20,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarger}" FontWeight="Normal"
                   Foreground="{DynamicResource TextBrushDarker}" />
        <Control Template="{DynamicResource DividerTemplate}" Width="132" Margin="0,12,0,0" Foreground="{DynamicResource HeadingRuleBrush}" />
    </StackPanel>
</Grid>`;

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const details = `<!--
    Rimewash: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): the whole page is a torn snow sheet on a soft shadow (SnowPlateTemplate); the
    banner (GameBannerHeight, default 380) sits inside it and fades into the sheet colour; spacer x * 286 / 380 (26 with no
    banner); title in the serif of the screen titles with Play (150x40), More and Edit (40x40 icon squares with tooltips,
    always visible) beside it (no rule under it); then screenshots, description and notes on the left and the
    inventory card (snow plate, GameDetailsPaneWidth 300) on the right. Section headers: serif title and a pencil rule
    (DividerTemplate). Metadata: every field in six collapsing groups, caption column 104 beside the value.
    Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRoot, 28)}
${indent(sheet('8,10,12,12'), 28)}
${indent(heroArt('38,38,38,0', 0.3, 0.64), 28)}
                            <StackPanel Margin="38,0,38,36">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 286 / 380', 26, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,12,0,14">
${indent(actions('16,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(title, 36)}
                                </DockPanel>
                                <Grid>
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="26" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${indent(textColumn, 36)}
${indent(pane('side', 'GameDetailsPaneWidth', '26,20,26,22').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Rimewash: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: torn snow sheet, banner spacer x * 232 / 380 (52 with no banner, room for the
    close button), title and actions under it, then text left and the inventory card right (GridDetailsPaneWidth,
    300 content width) with captions beside values. Close (CloseGameSideBarCommand) sits before the game icon below 120px banner
    height, otherwise at the top-left corner. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Grid>
                        <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                            <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRoot, 32)}
${indent(sheet('6,8,10,10'), 32)}
${indent(heroArt('26,26,26,0', 0.3, 0.54), 32)}
                                <StackPanel Panel.ZIndex="2" Margin="26,0,26,28">
${indent(hideWhenEmpty, 36)}
${indent(bannerSpacer('x * 232 / 380', 52, 'GridBannerSpacer'), 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="0,10,0,14">
${indent(gridTitle, 40)}
${indent(actions('0,14,0,0'), 40)}
                                    </StackPanel>
                                    <Grid>
                                        <Grid.ColumnDefinitions>
                                            <ColumnDefinition Width="*" />
                                            <ColumnDefinition Width="24" />
                                            <ColumnDefinition Width="Auto" />
                                        </Grid.ColumnDefinitions>
${indent(textColumn, 40)}
${indent(pane('stack', 'GridDetailsPaneWidth', '24,18,24,20').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 40)}
                                    </Grid>
                                </StackPanel>
${indent(emptyState, 32)}
                            </Grid>
                        </ScrollViewer>
${indent(sidePanelCloseButton(), 24)}
                    </Grid>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
