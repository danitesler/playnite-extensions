// Generates Gumshoe's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Gumshoe/art/gen-overviews.mjs src/themes/Gumshoe/src
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

// A score is a small pill with an ink rim, like the price tags: ink on paper whatever the rating (the green and red of the default score style are unreadable on paper).
const scoreRenderer = (part, layout) => `<Border${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center" BorderBrush="{DynamicResource ParchmentLabelBrush}" BorderThickness="2" CornerRadius="6" Padding="8,0,8,1">
    <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" Foreground="{DynamicResource ParchmentTextBrush}" />
</Border>`;

const fieldOptions = {
  margin: '0,3',
  captionFontSize: 'FontSize',
  captionForeground: 'ParchmentLabelBrush',
  captionMargin: '0,1,0,0',
  valueOptions: { textFontSize: 'FontSizeLarge', textForeground: 'ParchmentTextBrush' },
  scoreRenderer,
};

// A group rule is the ruled-paper dash: a 2px top border painted by a tiled dash brush (6px dash, 4px gap).
const dashRule = `<Border.BorderBrush>
    <DrawingBrush TileMode="Tile" Viewport="0,0,10,2" ViewportUnits="Absolute" Viewbox="0,0,10,2" ViewboxUnits="Absolute">
        <DrawingBrush.Drawing>
            <GeometryDrawing Brush="{DynamicResource ParchmentEdgeBrush}">
                <GeometryDrawing.Geometry>
                    <RectangleGeometry Rect="0,0,6,2" />
                </GeometryDrawing.Geometry>
            </GeometryDrawing>
        </DrawingBrush.Drawing>
    </DrawingBrush>
</Border.BorderBrush>`;

// Section header: the HUD's swallowtail ribbon (SECRET FOUND): a RibbonTemplate band behind the section's own Playnite caption in ink.
// The ribbon takes its width from its text.
const header = (loc, margin = '0,0,0,10') => `<Grid Margin="${margin}" Height="30" HorizontalAlignment="Left">
    <Control Template="{DynamicResource RibbonTemplate}" Foreground="{DynamicResource HeaderBandBrush}" Focusable="False" IsHitTestVisible="False" />
    <TextBlock Margin="28,0,28,2" VerticalAlignment="Center" FontSize="{DynamicResource FontSizeLarge}" Foreground="{DynamicResource HeaderBandForegroundBrush}"
               TextTrimming="CharacterEllipsis" Text="{DynamicResource ${loc}}" />
</Grid>`;

// The metadata pane: the case-file page. Ink on paper, two offset sheets behind it for the stacked page edges, the top-right corner turned down
// (the DogEarTemplate flap sits in a 28x28 cell where the page is cut away) and masking tape across the top-left. Groups sit in a clipping wrapper
// whose panel is pulled up by 2 x 6 + 2 + 3 = 17 (first rule hidden) and down by 3.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top" Margin="0,6,6,6">
    <Border Margin="6,6,-6,-6" Background="{DynamicResource ParchmentEdgeBrush}" CornerRadius="6" IsHitTestVisible="False" />
    <Border Margin="3,3,-3,-3" Background="{DynamicResource HeaderBandBrush}" CornerRadius="6" IsHitTestVisible="False" />
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*" />
            <ColumnDefinition Width="28" />
        </Grid.ColumnDefinitions>
        <Grid.RowDefinitions>
            <RowDefinition Height="28" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>
        <Border Grid.RowSpan="2" Background="{DynamicResource ParchmentBrush}" CornerRadius="6,0,0,6" />
        <Border Grid.Column="1" Grid.Row="1" Background="{DynamicResource ParchmentBrush}" CornerRadius="0,0,6,0" />
        <Control Grid.Column="1" Template="{DynamicResource DogEarTemplate}" Foreground="{DynamicResource SelectedBrush}" BorderBrush="{DynamicResource ParchmentEdgeBrush}"
                 Width="28" Height="28" HorizontalAlignment="Right" VerticalAlignment="Top" Focusable="False" IsHitTestVisible="False" />
        <Border Grid.ColumnSpan="2" Grid.RowSpan="2" Padding="${padding}">
            <StackPanel Width="{DynamicResource ${widthKey}}">
                <Grid ClipToBounds="True">
                    <StackPanel Margin="0,-17,0,-3">
${indent(META_GROUPS.map(g => metadataGroup(g, layout, {
  margin: '0,6,0,0',
  padding: '0,6,0,0',
  borderThickness: '0,2,0,0',
  borderBrush: '',
  extraBorderContent: dashRule,
  fieldOptions,
})).join('\n'), 28)}
                    </StackPanel>
                </Grid>
            </StackPanel>
        </Border>
        <Control Grid.ColumnSpan="2" Template="{DynamicResource TornPlateTemplate}" Background="{DynamicResource SelectedBrush}" Width="76" HorizontalAlignment="Left" VerticalAlignment="Top"
                 Margin="20,-12,0,0" RenderTransformOrigin="0.5,0.5" Focusable="False" IsHitTestVisible="False">
            <Control.RenderTransform>
                <TransformGroup>
                    <ScaleTransform ScaleY="0.75" />
                    <RotateTransform Angle="-4" />
                </TransformGroup>
            </Control.RenderTransform>
        </Control>
    </Grid>
</Grid>`;
}

// No OpacityMask on the banner: masked art repainted in part behind the animated Play button leaves dark seams on scaled
// displays. The fade is a plain gradient to the page color; a second gradient darkens the head. No wash: the source shows its art clean.
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

// Title: the book's page title: the game name in the heading face with the hand-drawn underline stroke under it (UnderlineTemplate takes the
// width of the name). PART_TextDisplayName is the real part; the underline vanishes when it is empty. No blurred shadow: DropShadowEffect is not used in this repo.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <StackPanel VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                   Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />
        <Control Template="{DynamicResource UnderlineTemplate}" Foreground="{DynamicResource TextBrush}" Margin="0,-6,0,0" Focusable="False" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Control'), 12)}
        </Control>
    </StackPanel>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid Width="150" Height="44" VerticalAlignment="Center">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="12,0,0,0" VerticalAlignment="Center" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="8,0,0,0" VerticalAlignment="Center" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = steamScreenshotsGate({
  borderThickness: '2',
  skeletonAttrs: 'CornerRadius="{DynamicResource CornerRadiusLarge}"',
  skeletonContent: `<Grid x:Name="SkeletonCells" Margin="8">
    <Grid.ColumnDefinitions>
        <ColumnDefinition />
        <ColumnDefinition Width="8" />
        <ColumnDefinition />
    </Grid.ColumnDefinitions>
    <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="2" CornerRadius="{DynamicResource ControlCornerRadius}" />
    <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="2" CornerRadius="{DynamicResource ControlCornerRadius}" />
</Grid>`,
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

// The spotlight's boil: three discrete frames, 160 ms apart, then a long hold (cartoon line boil).
const flicker = `<Storyboard RepeatBehavior="Forever">
    <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
        <DiscreteDoubleKeyFrame KeyTime="0:0:0" Value="0.2" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.16" Value="0.27" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.32" Value="0.23" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:0.48" Value="0.2" />
        <DiscreteDoubleKeyFrame KeyTime="0:0:2.4" Value="0.2" />
    </DoubleAnimationUsingKeyFrames>
</Storyboard>`;

// Empty state: the Roadhouse stage. A proscenium frame (two rounded rims) around a void stage, pleated curtains drawn to each side under a
// valance, marquee bulbs along the top, a spotlight cone with the Gumshoe mark in it and the "no game" line on a swallowtail ribbon at the foot.
// The spotlight's boil is an Opacity loop in its own Style (Opacity only: never animate a RenderTransform from a Style trigger here, the template is
// built with no game yet and Playnite crashes). Centered in the visible area.
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
    <Grid Width="340" Height="300" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,30" IsHitTestVisible="False">
        <Border Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="3" CornerRadius="26,26,6,6" />
        <Border Margin="9" BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="2" CornerRadius="18,18,3,3" />
        <Grid Margin="12,12,12,12">
            <Border Width="86" HorizontalAlignment="Left" Background="{DynamicResource PopupBackgroundBrush}" />
            <Control Template="{DynamicResource CurtainTemplate}" Foreground="{DynamicResource TextBrush}" Opacity="0.3" Width="86" HorizontalAlignment="Left" Focusable="False" />
            <Border Width="86" HorizontalAlignment="Right" Background="{DynamicResource PopupBackgroundBrush}" />
            <Control Template="{DynamicResource CurtainTemplate}" Tag="R" Foreground="{DynamicResource TextBrush}" Opacity="0.3" Width="86" HorizontalAlignment="Right" Focusable="False" />
            <Control Template="{DynamicResource SpotlightTemplate}" Foreground="{DynamicResource TextBrush}" Opacity="0.2" Width="180" Height="230" HorizontalAlignment="Center" VerticalAlignment="Top" Focusable="False">
${indent(whenEmpty('Control', 'SpotBoil', flicker), 16)}
            </Control>
            <Control Template="{DynamicResource SwagTemplate}" Foreground="{DynamicResource FrameBrush}" VerticalAlignment="Top" Margin="0,0,0,0" Focusable="False" />
            <Control Template="{DynamicResource BulbRowTemplate}" Foreground="{DynamicResource StripeBrush}" Opacity="0.8" VerticalAlignment="Top" Margin="6,16,6,0" Focusable="False" />
            <Control Template="{DynamicResource BrandMarkTemplate}" Foreground="{DynamicResource SelectedBrush}" Width="84" Height="84" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,22,0,0" Focusable="False" />
        </Grid>
        <Grid Width="272" Height="36" HorizontalAlignment="Center" VerticalAlignment="Bottom" Margin="0,0,0,-14">
            <Control Template="{DynamicResource RibbonTemplate}" Foreground="{DynamicResource HeaderBandBrush}" Focusable="False" />
            <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" Margin="32,0,32,2" HorizontalAlignment="Center" VerticalAlignment="Center" TextTrimming="CharacterEllipsis"
                       FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSize}" Foreground="{DynamicResource HeaderBandForegroundBrush}" />
        </Grid>
    </Grid>
</Grid>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const details = `<!--
    Gumshoe: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 300) shown clean, darkened at its
    head and faded into the page; spacer x * 126 / 300 (28 floor with no banner); the game name with its hand-drawn
    underline, the actions beside it (Play sticker 150x44, More and Edit 40x40 icon squares with tooltips, always
    visible); then the screenshots, description and notes under swallowtail ribbons on the left and the case-file page
    on the right (GameDetailsPaneWidth, 300 content width): dog-eared, taped, dashed ruled rows, price-tag chips.
    Empty state: the Roadhouse stage (curtains, spotlight, mark, marquee ribbon). Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 126 / 300', 20, 'DetailsBannerSpacer'), 32)}
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
${indent(pane('side', 'GameDetailsPaneWidth', '18,24,18,14').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
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
    Gumshoe: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 100 / 300 (14 floor), the underlined game name,
    actions under it, then text left and the case-file page right (GridDetailsPaneWidth, 300 content width) with
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
${indent(bannerSpacer('x * 100 / 300', 14, 'GridBannerSpacer'), 40)}
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
${indent(pane('stack', 'GridDetailsPaneWidth', '18,24,18,14').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ exitDuration: '0:0:0.2' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, gridView);
