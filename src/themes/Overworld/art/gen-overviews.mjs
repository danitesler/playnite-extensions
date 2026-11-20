// Generates Overworld's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Overworld/art/gen-overviews.mjs
import {
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  indent,
  inlineCloseButton,
  metaGroups,
  metadataGroup,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);
const GROUPS = metaGroups({ plural: true });

// Rhythm: 12px above and below each group rule, 8px above and below each field.
const GROUP_GAP = 12;
const FIELD_GAP = 8;

const sharedValueOptions = {
  buttonStyleKind: 'StaticResource',
  textStyle: 'BaseTextBlockStyle',
  textVerticalCenter: false,
  scoreVerticalCenter: false,
  itemsWrapPanel: false,
  chipsMargin: '0,0,0,-6',
};

function paneXaml(beside) {
  const layout = beside ? 'side' : 'stack';
  const top = -(2 * GROUP_GAP + 1 + FIELD_GAP);
  const fieldOptions = beside
    ? {
        wrapper: 'Grid',
        margin: `0,${FIELD_GAP},0,${FIELD_GAP}`,
        sideColumnWidth: '112',
        sideValueWrapper: false,
        captionStyle: 'HeadingTextBlock',
        captionFontSize: 'FontSize',
        captionForeground: '',
        captionSideMargin: '0,0,12,0',
        valueOptions: { ...sharedValueOptions, scoreWrap: false },
      }
    : {
        wrapper: 'Grid',
        margin: `0,${FIELD_GAP},0,${FIELD_GAP}`,
        captionStyle: 'HeadingTextBlock',
        captionFontSize: 'FontSize',
        captionForeground: '',
        valueOptions: sharedValueOptions,
      };
  const groups = GROUPS.map(g => metadataGroup(g, layout, {
    margin: `0,${GROUP_GAP},0,0`,
    padding: `0,${GROUP_GAP},0,0`,
    borderThickness: '0,1,0,0',
    borderBrush: 'MenuSeparatorBrush',
    basedOn: '{StaticResource {x:Type Border}}',
    fieldOptions,
  })).join('\n');
  // The pane is a list panel of the game's menus (ExpanderBackgroundBrush) in the 1px black widget outline.
  const widthKey = beside ? 'GameDetailsPaneWidth' : 'GridDetailsPaneWidth';
  return `<Border Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource SlotBorderBrush}"
        BorderThickness="1" Padding="16,16,16,16">
    <Border ClipToBounds="True" Width="{DynamicResource ${widthKey}}">
        <StackPanel Margin="0,${top},0,-${FIELD_GAP}">
${indent(groups, 12)}
        </StackPanel>
    </Border>
</Border>`;
}

const heading = (textKey, top = '0,0,0,0') =>
  `<TextBlock Text="{DynamicResource ${textKey}}" Margin="${top}" Style="{DynamicResource HeadingTextBlock}" />\n<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,8,0,12" />`;

const STEAM = steamScreenshotsGate({
  mode: 'storyboard',
  heading: heading('LOC_SteamScreenshots_SteamScreenshotsLabel'),
  includeSourceLoadingTrigger: false,
});

const TEXT_COLUMN = `${STEAM}
<StackPanel Name="PART_ElemDescription" Margin="0,0,0,24">
${indent(heading('LOCGameDescriptionTitle'), 4)}
    <HtmlTextView Name="PART_HtmlDescription"
                  HtmlFontSize="{DynamicResource FontSize}"
                  HtmlFontFamily="{DynamicResource FontFamily}"
                  HtmlForeground="{DynamicResource TextColor}"
                  LinkForeground="{DynamicResource GlyphColor}"
                  ScrollViewer.HorizontalScrollBarVisibility="Disabled"
                  ScrollViewer.VerticalScrollBarVisibility="Disabled"
                  pbeh:FocusBahaviors.BlockBringIntoViewRequest="True" />
</StackPanel>
<StackPanel Name="PART_ElemNotes" Margin="0,0,0,16">
${indent(heading('LOCNotesLabel'), 4)}
    <TextBox Name="PART_TextNotes" IsReadOnly="True"
             BorderThickness="0" Background="Transparent"
             AcceptsReturn="True" TextWrapping="Wrap"
             Margin="-1,0,-1,0" Padding="0" />
</StackPanel>`;

function hero(brush, name = 'HeroArt') {
  return `<Grid x:Name="${name}" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
${indent(heroVisibilityStyle({ mode: 'visibility', includeNullGame: false }), 4)}
    <Grid.CacheMode>
        <BitmapCache EnableClearType="False" RenderAtScale="1" SnapsToDevicePixels="False" />
    </Grid.CacheMode>
    <Grid.OpacityMask>
        <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
            <GradientStop Color="Black" Offset="0" />
            <GradientStop Color="Black" Offset="0.45" />
            <GradientStop Color="Transparent" Offset="1" />
        </LinearGradientBrush>
    </Grid.OpacityMask>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
               HorizontalAlignment="Center" VerticalAlignment="Center" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Scrim: the page's own brush, light at the top, closing in toward the title. -->
    <Border Background="{DynamicResource ${brush}}">
        <Border.OpacityMask>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#33000000" Offset="0" />
                <GradientStop Color="#80000000" Offset="0.5" />
                <GradientStop Color="#E6000000" Offset="1" />
            </LinearGradientBrush>
        </Border.OpacityMask>
    </Border>
    <!-- Side vignette, like the dimmed edges of the title screen panorama. -->
    <Border Background="{DynamicResource ${brush}}">
        <Border.OpacityMask>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="#99000000" Offset="0" />
                <GradientStop Color="Transparent" Offset="0.35" />
                <GradientStop Color="Transparent" Offset="0.8" />
                <GradientStop Color="#66000000" Offset="1" />
            </LinearGradientBrush>
        </Border.OpacityMask>
    </Border>
</Grid>`;
}

const editButton = (ancestor, margin, size, column = '') => {
  const col = column ? `Grid.Column="${column}" ` : '';
  return `<Button x:Name="PART_ButtonEditGame" ${col}Margin="${margin}" Height="${size}" Width="${size}" Padding="0" Focusable="False"
        ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Width="24" Height="24" Focusable="False" IsTabStop="False"
                    Content="{DynamicResource IconEdit}"
                    ContentTemplate="{DynamicResource IconTemplate}" />
</Button>`;
};

// The pixel font in white with the game's text shadow (TextShadowBrush, offset by about size / 12), drawn by a
// second TextBlock bound to the part's text, since PART_TextDisplayName may appear only once.
const title = (size, shadow) => `<Grid>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" Margin="${shadow},${shadow},-${shadow},-${shadow}"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="${size}"
               TextWrapping="Wrap" VerticalAlignment="Center" IsHitTestVisible="False"
               Foreground="{DynamicResource TextShadowBrush}" />
    <TextBlock Name="PART_TextDisplayName"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="${size}"
               TextWrapping="Wrap" VerticalAlignment="Center"
               Foreground="{DynamicResource SelectedForegroundBrush}" />
</Grid>`;

// The title screen's splash text ([src] SplashRenderer: yellow, rotated -20 degrees, at the logo's right end), here
// the game's completion status with an exclamation mark; hidden while the game has none.
const splash = (size, margin) => `<Grid Margin="${margin}" VerticalAlignment="Top" HorizontalAlignment="Left" IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game.CompletionStatus}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Grid.RenderTransform>
        <RotateTransform Angle="-20" />
    </Grid.RenderTransform>
    <TextBlock Text="{Binding Game.CompletionStatus.Name, StringFormat={}{0}!}" Margin="2,2,-2,-2"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="${size}"
               Foreground="{DynamicResource TextShadowBrush}" />
    <TextBlock Text="{Binding Game.CompletionStatus.Name, StringFormat={}{0}!}"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="${size}"
               Foreground="{DynamicResource GlyphBrush}" />
</Grid>`;

const HEADER_NOTE = `    HtmlForeground and LinkForeground are Color-typed properties of HtmlTextView, so they read Color keys (the build
    check allows exactly these two attributes). Generated by art/gen-overviews.mjs; edit the generator, not this file.`;

function wrap(name, desc, body) {
  return `<!--
    Overlay on Playnite Default/Views/${name}.xaml.
${desc}
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:pbeh="clr-namespace:Playnite.Behaviors;assembly=Playnite">

    <Style TargetType="{x:Type ${name}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type ${name}}">
${indent(body, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

function details() {
  const header = `<DockPanel Margin="0,24,0,28" MaxWidth="1100" Grid.Row="1" Background="Transparent">
    <!-- Cover: a black slot with a 1px edge, hidden while the game has no cover. -->
    <Border DockPanel.Dock="Right" VerticalAlignment="Bottom" Margin="28,0,0,0"
            BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1"
            Background="{DynamicResource GridItemBackgroundBrush}">
        <Border.Style>
            <Style TargetType="Border">
                <Style.Triggers>
                    <DataTrigger Binding="{Binding Source, ElementName=PART_ImageCover}" Value="{x:Null}">
                        <Setter Property="Visibility" Value="Collapsed" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </Border.Style>
        <Image Name="PART_ImageCover" Height="{Settings GameDetailsCoverHeight}"
               StretchDirection="Both" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant" />
    </Border>

    <StackPanel VerticalAlignment="Bottom" DockPanel.Dock="Left">
        <Grid>
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="Auto" />
                <ColumnDefinition Width="Auto" />
                <ColumnDefinition Width="*" />
            </Grid.ColumnDefinitions>
            <Image Name="PART_ImageIcon" MaxHeight="40" MaxWidth="40" Margin="0,0,14,0"
                   VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
            <Grid Grid.Column="1" MaxWidth="640">
${indent(title('{DynamicResource FontSizeLargest}', 3), 16)}
            </Grid>
            <Grid Grid.Column="2">
${indent(splash(18, '12,-6,0,0'), 16)}
            </Grid>
        </Grid>
        <StackPanel HorizontalAlignment="Left" Orientation="Horizontal" Margin="0,18,0,0">
            <Grid>
                <Button Name="PART_ButtonPlayAction" Width="220" Height="48" Style="{DynamicResource PlayButton}" />
                <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" Width="220" Height="48" />
                <Control Style="{DynamicResource RunningActionIndicator}" />
            </Grid>
            <Button Name="PART_ButtonMoreActions" Width="48" Height="48" Margin="12,0,0,0" Padding="0"
                    ToolTip="{DynamicResource LOCMoreAction}">
                <ContentControl Width="24" Height="24" Focusable="False" IsTabStop="False"
                                Content="{DynamicResource IconOptions}"
                                ContentTemplate="{DynamicResource IconTemplate}" />
            </Button>
${indent(editButton('DockPanel', '12,0,0,0', 48), 12)}
        </StackPanel>
    </StackPanel>
</DockPanel>`;

  const columns = `<DockPanel MaxWidth="1100" Grid.Row="2">
    <StackPanel DockPanel.Dock="Right" Margin="32,0,0,24">
${indent(heading('LOCGameDetails'), 8)}
${indent(paneXaml(true), 8)}
    </StackPanel>
    <StackPanel>
${indent(TEXT_COLUMN, 8)}
    </StackPanel>
</DockPanel>`;

  const body = `<Grid>
        <Grid.Style>
            <Style TargetType="Grid">
                <Setter Property="Background" Value="{DynamicResource ContentBackgroundBrush}" />
                <Style.Triggers>
                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                        <Setter Property="Background" Value="Transparent" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </Grid.Style>
    <Grid>
        <Grid.Style>
            <Style TargetType="Grid">
                <Style.Triggers>
                    <Trigger Property="DataContext" Value="{x:Null}">
                        <Setter Property="Visibility" Value="Collapsed" />
                    </Trigger>
                </Style.Triggers>
            </Style>
        </Grid.Style>
        <ScrollViewer HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
              Style="{DynamicResource DetailsScrollViewer}" Visibility="Visible" x:Name="PART_ScrollViewHost">
    <Grid>
${indent(hero('ContentBackgroundBrush'), 8)}
        <Grid HorizontalAlignment="Stretch" Margin="32,0,40,0">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto" />
                <RowDefinition Height="Auto" />
                <RowDefinition Height="*" />
            </Grid.RowDefinitions>
${indent(bannerSpacer('x * 150 / 340', 8, 'DetailsBannerSpacer'), 12)}
${indent(header, 12)}
${indent(columns, 12)}
        </Grid>
    </Grid>
</ScrollViewer>
    </Grid>
    <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" VerticalAlignment="Center"
               TextAlignment="Center" TextWrapping="Wrap" Margin="24" Foreground="{DynamicResource TextBrushDarker}"
               FontSize="{DynamicResource FontSizeLarge}">
        <TextBlock.Style>
            <Style TargetType="TextBlock" BasedOn="{StaticResource BaseTextBlockStyle}">
                <Setter Property="Visibility" Value="Collapsed" />
                <Style.Triggers>
                    <Trigger Property="DataContext" Value="{x:Null}">
                        <Setter Property="Visibility" Value="Visible" />
                    <Trigger.EnterActions>
                        <BeginStoryboard x:Name="EmptyPulse">
                            <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                <DoubleAnimation Storyboard.TargetProperty="Opacity" From="1" To="0.55" Duration="0:0:2.8">
                                    <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
                                </DoubleAnimation>
                            </Storyboard>
                        </BeginStoryboard>
                    </Trigger.EnterActions>
                    <Trigger.ExitActions>
                        <RemoveStoryboard BeginStoryboardName="EmptyPulse" />
                    </Trigger.ExitActions>
                    </Trigger>
                </Style.Triggers>
            </Style>
        </TextBlock.Style>
    </TextBlock>
</Grid>`;
  return wrap('DetailsViewGameOverview', `    The game page of the Details view, laid out like the title screen: the game's art as a wide banner (the
    panorama), darkened toward the title and at the sides; the title in the pixel font, large and white with the game's
    text shadow, and beside it a yellow splash text rotated -20 degrees (the completion status); a header separator;
    then the green Play button (DerivedStyles/PlayButton.xaml) with stone buttons beside it, and the cover in a black
    outline on the right. Below, two columns: Steam screenshots, description and notes on the left under pixel-font
    captions; on the right Game details, every metadata field in one list panel (1px black outline) of six groups
    split by separators, captions beside the values.
${HEADER_NOTE}`, body);
}

function gridPanel() {
  const columns = `<Grid VerticalAlignment="Top">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="24" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <StackPanel Grid.Column="0">
${indent(TEXT_COLUMN, 8)}
    </StackPanel>
    <StackPanel Grid.Column="2" Margin="0,0,0,24" VerticalAlignment="Top">
${indent(heading('LOCGameDetails'), 8)}
${indent(paneXaml(false), 8)}
    </StackPanel>
</Grid>`;

  const header = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
    <Image Name="PART_ImageIcon" DockPanel.Dock="Left" MaxHeight="32" MaxWidth="32"
           RenderOptions.BitmapScalingMode="Fant" Margin="0,0,12,0" />
${indent(title('{DynamicResource FontSizeLargest}', 2), 4)}
</DockPanel>
${splash(14, '0,8,0,-4')}
<Grid Margin="0,16,0,24" Background="Transparent">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" MaxWidth="200" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <Button Name="PART_ButtonPlayAction" Grid.Column="0" Height="44" Style="{DynamicResource PlayButton}" />
    <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" Grid.Column="0" Height="44" />
    <Button Name="PART_ButtonMoreActions" Grid.Column="1" Width="44" Height="44" Margin="10,0,0,0" Padding="0"
            ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Width="24" Height="24" Focusable="False" IsTabStop="False"
                        Content="{DynamicResource IconOptions}"
                        ContentTemplate="{DynamicResource IconTemplate}" />
    </Button>
${indent(editButton('Grid', '10,0,8,0', 44, '2'), 4)}
    <Control Grid.Column="0" Style="{DynamicResource RunningActionIndicator}" />
</Grid>
${columns}`;

  const body = `<Border BorderBrush="{DynamicResource SlotBorderBrush}">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Background" Value="{DynamicResource NormalBrush}" />
            <Setter Property="BorderThickness" Value="1,0,0,0" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                    <Setter Property="BorderThickness" Value="0,0,1,0" />
                </DataTrigger>
                <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False">
                    <Setter Property="BorderThickness" Value="0" />
                </DataTrigger>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Background" Value="Transparent" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
    <Grid>
        <DockPanel>
            <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" Margin="0,20,0,0" DockPanel.Dock="Top"
                       HorizontalAlignment="Center" VerticalAlignment="Center">
                <TextBlock.Style>
                    <Style TargetType="TextBlock" BasedOn="{StaticResource BaseTextBlockStyle}">
                        <Setter Property="Visibility" Value="Collapsed" />
                        <Style.Triggers>
                            <Trigger Property="DataContext" Value="{x:Null}">
                                <Setter Property="Visibility" Value="Visible" />
                            <Trigger.EnterActions>
                                <BeginStoryboard x:Name="EmptyPulse">
                                    <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                        <DoubleAnimation Storyboard.TargetProperty="Opacity" From="1" To="0.55" Duration="0:0:2.8">
                                            <DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction>
                                        </DoubleAnimation>
                                    </Storyboard>
                                </BeginStoryboard>
                            </Trigger.EnterActions>
                            <Trigger.ExitActions>
                                <RemoveStoryboard BeginStoryboardName="EmptyPulse" />
                            </Trigger.ExitActions>
                            </Trigger>
                        </Style.Triggers>
                    </Style>
                </TextBlock.Style>
            </TextBlock>
            <ScrollViewer CanContentScroll="False" DockPanel.Dock="Top" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
                          x:Name="PART_ScrollViewHost">
                <ScrollViewer.Style>
                    <Style TargetType="ScrollViewer" BasedOn="{StaticResource {x:Type ScrollViewer}}">
                        <Style.Triggers>
                            <Trigger Property="DataContext" Value="{x:Null}">
                                <Setter Property="Visibility" Value="Collapsed" />
                            </Trigger>
                        </Style.Triggers>
                    </Style>
                </ScrollViewer.Style>
                <Grid>
${indent(hero('NormalBrush'), 20)}
                    <StackPanel Margin="24,0,24,0">
${indent(bannerSpacer('x * 110 / 340', 4, 'GridBannerSpacer'), 24)}
                        <StackPanel Margin="0,20,0,0">
${indent(header, 28)}
                        </StackPanel>
                    </StackPanel>
                </Grid>
            </ScrollViewer>
        </DockPanel>
${indent(sidePanelCloseButton({ preset: 'plate' }), 8)}
    </Grid>
</Border>`;
  return wrap('GridViewGameOverview', `    The game panel beside the cover grid, a list panel of the game's menus (NormalBrush) with a 1px black outline on
    the grid side: the game's art as a banner at the top, darkened toward the title; the title in the pixel font with
    its shadow, the yellow splash (completion status) under it, a header separator; the green Play button and a stone
    button under it; then two columns: Steam screenshots, description and notes on the left, Game details on the
    right (the six metadata groups in a list panel, captions beside values). A close button sits before the icon below 120px banner height, otherwise over the top-left
    corner.
${HEADER_NOTE}`, body);
}

writeOverviews(out, details(), gridPanel());
