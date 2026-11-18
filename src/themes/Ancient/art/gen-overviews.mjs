// Generates Ancient's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Ancient/art/gen-overviews.mjs
import {
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  indent,
  inlineCloseButton,
  metaGroups,
  metadataGroup,
  pageRootStyle,
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
        captionFontSize: 'FontSizeSmall',
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
  // No card of its own: transparent with no edge, so the fields start flush
  // with the Game details caption; groups still split by 1px dark lines.
  return `<Border Background="Transparent" BorderThickness="0" Padding="0,4,0,4">
    <Border ClipToBounds="True">
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
  includeSourceLoadingTrigger: true,
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
    <!-- No OpacityMask and no BitmapCache on the banner: masked art repainted in part (behind the animated PLAY button) left dark
         seams on scaled displays. The scrim, the side vignette and the fade into the page are plain gradients in the page brush;
         the fade stops at half strength, which is how far the library art under the page is veiled (Views/Library.xaml). -->
    <Border x:Name="LayerSwatch" Background="{DynamicResource ${brush}}" Visibility="Collapsed" />
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
               HorizontalAlignment="Center" VerticalAlignment="Center" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Scrim: the page's own brush, light at the top, closing in toward the title. -->
    <Rectangle Opacity="0.9">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#00000000" Offset="0" />
                <GradientStop Color="{Binding Background.Color, ElementName=LayerSwatch}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Side vignette, like the dashboard's darkened scene edges. -->
    <Rectangle Opacity="0.6">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="{Binding Background.Color, ElementName=LayerSwatch}" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.35" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Opacity="0.4">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="#00000000" Offset="0.8" />
                <GradientStop Color="{Binding Background.Color, ElementName=LayerSwatch}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Fade into the page. -->
    <Rectangle Opacity="0.5">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#00000000" Offset="0.45" />
                <GradientStop Color="{Binding Background.Color, ElementName=LayerSwatch}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;
}

const ATTR_DETAILS = ' HorizontalAlignment="Stretch" Margin="32,0,40,0"';
const ATTR_GRID = ' Margin="24,0,24,0"';

function emptyState(viewport) {
  const height = viewport ? 'VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}"' : 'VerticalAlignment="Center"';
  return `<!-- Empty state (no game selected): the keystone mark, outline only, with the dashboard's SearchingAnimation on it ([CSS]
     play.css: wash-color white to #7aa8b7 and back, a 2s loop), and "No game selected" in the title face. The loop runs only
     while this shows (RemoveStoryboard on exit). Centered in the visible area. -->
<Grid ${height}>
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
        <Grid Width="72" Height="72" HorizontalAlignment="Center">
            <Path Data="M12 2.5 L20.5 7.4 L18.4 18.6 L12 21.4 L5.6 18.6 L3.5 7.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                  Stroke="{DynamicResource TextBrushDarker}" Margin="2" />
            <Path Data="M12 7 L16.2 9.4 L15.1 15.6 L12 17 L8.9 15.6 L7.8 9.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                  Stroke="{DynamicResource TextBrushDarker}" Margin="20" />
            <Grid>
                <Grid.Style>
                    <Style TargetType="Grid">
                        <Setter Property="Opacity" Value="0" />
                        <Style.Triggers>
                            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                <DataTrigger.EnterActions>
                                    <BeginStoryboard x:Name="KeystoneWash">
                                        <Storyboard RepeatBehavior="Forever">
                                            <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
                                                <EasingDoubleKeyFrame KeyTime="0:0:0" Value="0" />
                                                <EasingDoubleKeyFrame KeyTime="0:0:1" Value="1"><EasingDoubleKeyFrame.EasingFunction><SineEase EasingMode="EaseInOut" /></EasingDoubleKeyFrame.EasingFunction></EasingDoubleKeyFrame>
                                                <EasingDoubleKeyFrame KeyTime="0:0:2" Value="0"><EasingDoubleKeyFrame.EasingFunction><SineEase EasingMode="EaseInOut" /></EasingDoubleKeyFrame.EasingFunction></EasingDoubleKeyFrame>
                                            </DoubleAnimationUsingKeyFrames>
                                        </Storyboard>
                                    </BeginStoryboard>
                                </DataTrigger.EnterActions>
                                <DataTrigger.ExitActions>
                                    <RemoveStoryboard BeginStoryboardName="KeystoneWash" />
                                </DataTrigger.ExitActions>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Grid.Style>
                <Path Data="M12 2.5 L20.5 7.4 L18.4 18.6 L12 21.4 L5.6 18.6 L3.5 7.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                      Stroke="{DynamicResource SelectedForegroundBrush}" Margin="2" />
                <Path Data="M12 7 L16.2 9.4 L15.1 15.6 L12 17 L8.9 15.6 L7.8 9.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                      Stroke="{DynamicResource SelectedForegroundBrush}" Margin="20" />
            </Grid>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,22,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarge}" FontWeight="SemiBold"
                   Typography.Capitals="AllSmallCaps" Foreground="{DynamicResource TextBrushDarker}" />
    </StackPanel>
</Grid>`;
}

const hideEmpty = (kind = 'Grid', attrs = '') =>
  `<${kind}${attrs}>\n${indent(hideWhenNoGame(kind), 4)}`;

const editButton = (margin, size, column = null) => {
  const col = column !== null ? ` Grid.Column="${column}"` : '';
  return `<Button x:Name="PART_ButtonEditGame"${col} Margin="${margin}" Height="${size}" Width="${size}" Padding="0" Focusable="False"
        ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                    Content="{DynamicResource IconEdit}"
                    ContentTemplate="{DynamicResource IconTemplate}" />
</Button>`;
};

const title = (size) => `<TextBlock Name="PART_TextDisplayName"
           FontFamily="{DynamicResource HeadingFontFamily}"
           FontSize="${size}" FontWeight="SemiBold"
           Typography.Capitals="AllSmallCaps"
           TextWrapping="Wrap" VerticalAlignment="Center"
           Foreground="{DynamicResource SelectedForegroundBrush}" />`;

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
        <DockPanel>
            <Image Name="PART_ImageIcon" MaxHeight="40" MaxWidth="40" DockPanel.Dock="Left" Margin="0,0,14,0"
                   VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
${indent(title(38), 12)}
        </DockPanel>
        <StackPanel HorizontalAlignment="Left" Orientation="Horizontal" Margin="0,12,0,0">
            <Grid>
                <Button Name="PART_ButtonPlayAction" Width="220" Height="48" Style="{DynamicResource PlayButton}" />
                <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" Width="220" Height="48" />
                <Control Style="{DynamicResource RunningActionIndicator}" Height="48" />
            </Grid>
            <Button Name="PART_ButtonMoreActions" Width="48" Height="48" Padding="0" Margin="12,0,0,0"
                    ToolTip="{DynamicResource LOCMoreAction}" Focusable="False">
                <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                                Content="{DynamicResource IconOptions}"
                                ContentTemplate="{DynamicResource IconTemplate}" />
            </Button>
${indent(editButton('12,0,0,0', 48), 12)}
        </StackPanel>
    </StackPanel>
</DockPanel>`;

  const columns = `<DockPanel MaxWidth="1100" Grid.Row="2">
    <StackPanel DockPanel.Dock="Right" Width="{DynamicResource GameDetailsPaneWidth}" Margin="32,0,0,24">
${indent(heading('LOCGameDetails'), 8)}
${indent(paneXaml(true), 8)}
    </StackPanel>
    <StackPanel>
${indent(TEXT_COLUMN, 8)}
    </StackPanel>
</DockPanel>`;

  const body = `<ScrollViewer HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
              Style="{DynamicResource DetailsScrollViewer}" Visibility="Visible" x:Name="PART_ScrollViewHost">
    <Grid>
${indent(hero('ContentBackgroundBrush'), 8)}
${indent(hideEmpty('Grid', ATTR_DETAILS), 8)}
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto" />
                <RowDefinition Height="Auto" />
                <RowDefinition Height="*" />
            </Grid.RowDefinitions>
${indent(bannerSpacer('x * 150 / 340', 8, 'DetailsBannerSpacer'), 12)}
${indent(header, 12)}
${indent(columns, 12)}
        </Grid>
${indent(emptyState(true), 8)}
    </Grid>
</ScrollViewer>`;
  return wrap('DetailsViewGameOverview', `    The game page of the Details view, read like a hero page of the Dota 2 dashboard: the game's art as a wide banner
    behind the header, darkened toward the title and at the sides; the title in the title font, large and white, with
    no rule under it; then the green PLAY button (DerivedStyles/PlayButton.xaml) with the grey bevel buttons
    beside it, and the cover in a black slot on the right. Below, two columns: Steam screenshots, description and
    notes on the left under section captions; on the right Game details, every metadata field with no card of its own
    (transparent, no edge, flush with the caption), six groups split by 1px dark lines, captions beside the values.
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
    <StackPanel Grid.Column="2" Width="{DynamicResource GridDetailsPaneWidth}" Margin="0,0,0,24" VerticalAlignment="Top">
${indent(heading('LOCGameDetails'), 8)}
${indent(paneXaml(false), 8)}
    </StackPanel>
</Grid>`;

  const header = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
    <Image Name="PART_ImageIcon" DockPanel.Dock="Left" MaxHeight="32" MaxWidth="32"
           RenderOptions.BitmapScalingMode="Fant" Margin="0,0,12,0" />
${indent(title('{DynamicResource FontSizeLargest}'), 4)}
</DockPanel>
<Grid Margin="0,12,0,24" Background="Transparent">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" MaxWidth="200" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <Button Name="PART_ButtonPlayAction" Grid.Column="0" Height="44" Style="{DynamicResource PlayButton}" />
    <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" Grid.Column="0" Height="44" />
    <Button Name="PART_ButtonMoreActions" Grid.Column="1" Width="44" Height="44" Padding="0" Margin="10,0,0,0"
            ToolTip="{DynamicResource LOCMoreAction}" Focusable="False">
        <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                        Content="{DynamicResource IconOptions}"
                        ContentTemplate="{DynamicResource IconTemplate}" />
    </Button>
${indent(editButton('10,0,0,0', 44, 2), 4)}
    <Control Style="{DynamicResource RunningActionIndicator}" Grid.Column="0" Height="44" />
</Grid>
${columns}`;

  const body = `<Border BorderBrush="{DynamicResource BevelShadowBrush}" Background="Transparent">
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
${indent(emptyState(false), 8)}
        <DockPanel>
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
${indent(hero('ContentBackgroundBrush'), 20)}
${indent(hideEmpty('StackPanel', ATTR_GRID), 20)}
${indent(bannerSpacer('x * 110 / 340', 4, 'GridBannerSpacer'), 24)}
                        <StackPanel Margin="0,20,0,0">
${indent(header, 28)}
                        </StackPanel>
                    </StackPanel>
                </Grid>
            </ScrollViewer>
        </DockPanel>
${indent(sidePanelCloseButton(), 8)}
    </Grid>
</Border>`;
  return wrap('GridViewGameOverview', `    The game panel beside the cover grid, transparent like the Details view so the library art shows through: the
    game's art as a banner at the top with the same scrim and gradient transition toward the title; the title in
    the title font with no rule under it; the green PLAY button and a grey bevel button under it; then two
    columns: Steam screenshots, description and notes on the left, Game details on the right (the six metadata
    groups with no card, captions beside values). A 1px edge on the grid side and a close button before the icon below 120px banner height, otherwise over the top-left corner.
${HEADER_NOTE}`, body);
}

writeOverviews(out, details(), gridPanel());
