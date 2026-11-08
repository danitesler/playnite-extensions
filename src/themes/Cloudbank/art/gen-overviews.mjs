// Generates Cloudbank's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from one field table.
// Usage: node src/themes/Cloudbank/art/gen-overviews.mjs src/themes/Cloudbank/src
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
if (!out) throw new Error('pass the theme src dir');

const groups = [
  ['MetaProgress', [
    ['CompletionStatus', 'LOCCompletionStatus', 'button', 'PART_ButtonCompletionStatus'],
    ['PlayTime', 'LOCTimePlayed', 'text', 'PART_TextPlayTime'],
    ['LastPlayed', 'LOCLastPlayed', 'text', 'PART_TextLastActivity'],
    ['RecentActivity', 'LOCRecentActivityLabel', 'text', 'PART_TextRecentActivity'],
    ['Added', 'LOCDateAddedLabel', 'text', 'PART_TextAdded'],
  ]],
  ['MetaScores', [
    ['CommunityScore', 'LOCCommunityScore', 'score', 'PART_TextCommunityScore'],
    ['CriticScore', 'LOCCriticScore', 'score', 'PART_TextCriticScore'],
    ['UserScore', 'LOCUserScore', 'score', 'PART_TextUserScore'],
  ]],
  ['MetaAbout', [
    ['Developers', 'LOCDeveloperLabel', 'items', 'PART_ItemsDevelopers'],
    ['Publishers', 'LOCPublisherLabel', 'items', 'PART_ItemsPublishers'],
    ['ReleaseDate', 'LOCGameReleaseDateTitle', 'button', 'PART_ButtonReleaseDate'],
    ['Series', 'LOCSeriesLabel', 'items', 'PART_ItemsSeries'],
    ['AgeRating', 'LOCAgeRatingLabel', 'items', 'PART_ItemsAgeRatings'],
    ['Region', 'LOCRegionLabel', 'items', 'PART_ItemsRegions'],
  ]],
  ['MetaTags', [
    ['Platform', 'LOCPlatformTitle', 'chips', 'PART_ItemsPlatforms'],
    ['Genres', 'LOCGenreLabel', 'chips', 'PART_ItemsGenres'],
    ['Categories', 'LOCGameCategoriesTitle', 'chips', 'PART_ItemsCategories'],
    ['Features', 'LOCFeaturesLabel', 'chips', 'PART_ItemsFeatures'],
    ['Tags', 'LOCTagsLabel', 'chips', 'PART_ItemsTags'],
  ]],
  ['MetaLibrary', [
    ['Library', 'LOCGameProviderTitle', 'button', 'PART_ButtonLibrary'],
    ['Source', 'LOCSourceLabel', 'button', 'PART_ButtonSource'],
    ['Version', 'LOCVersionLabel', 'button', 'PART_ButtonVersion'],
    ['InstallSize', 'LOCInstallSizeLabel', 'text', 'PART_TextInstallSize'],
    ['InstallDirectory', 'LOCGameInstallDirTitle', 'button', 'PART_ButtonInstallDirectory'],
  ]],
  ['MetaLinks', [
    ['Links', 'LOCLinksLabel', 'items', 'PART_ItemsLinks'],
  ]],
];

const ind = (s, n) => s.split('\n').map(l => (l ? ' '.repeat(n) + l : l)).join('\n');

function value(kind, part) {
  switch (kind) {
    case 'button': return `<Button x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource PropertyItemButton}" />`;
    case 'text': return `<TextBlock x:Name="${part}" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="{DynamicResource TextBrush}" />`;
    case 'score': return `<TextBlock x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource TextBlockGameScore}" />`;
    case 'items':
    case 'chips': return `<ItemsControl x:Name="${part}" Tag="${kind === 'chips' ? 'Chip' : ''}">
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <WrapPanel />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>`;
  }
}

const caption = (loc, extra = '') =>
  `<TextBlock Text="{DynamicResource ${loc}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="SemiBold" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap"${extra || ' Margin="0,2,0,0"'} />`;

function field([name, loc, kind, part], layout) {
  if (layout === 'side') {
    return `<Border x:Name="PART_Elem${name}" Margin="0,8">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="104" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>
        ${caption(loc)}
        <Border Grid.Column="1" Margin="8,0,0,0">
${ind(value(kind, part), 12)}
        </Border>
    </Grid>
</Border>`;
  }
  let gridValue = value(kind, part).replace(' x:Name=', ' Grid.Column="2" x:Name=');
  if (kind === 'score') gridValue = gridValue.replace(' />', ' TextWrapping="Wrap" />');
  return `<Border x:Name="PART_Elem${name}" Margin="0,8">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="2*" />
            <ColumnDefinition Width="12" />
            <ColumnDefinition Width="3*" />
        </Grid.ColumnDefinitions>
        ${caption(loc, ' VerticalAlignment="Top"')}
${ind(gridValue, 8)}
    </Grid>
</Border>`;
}

function group([gname, fields], layout) {
  const conds = fields.map(f => `<Condition Binding="{Binding Visibility, ElementName=PART_Elem${f[0]}}" Value="Collapsed" />`);
  const trig = fields.length === 1
    ? `<DataTrigger Binding="{Binding Visibility, ElementName=PART_Elem${fields[0][0]}}" Value="Collapsed">
    <Setter Property="Visibility" Value="Collapsed" />
</DataTrigger>`
    : `<MultiDataTrigger>
    <MultiDataTrigger.Conditions>
${ind(conds.join('\n'), 8)}
    </MultiDataTrigger.Conditions>
    <Setter Property="Visibility" Value="Collapsed" />
</MultiDataTrigger>`;
  return `<Border x:Name="${gname}" Margin="0,12,0,0" Padding="0,12,0,0" BorderThickness="0,1,0,0" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
${ind(trig, 16)}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
${ind(fields.map(f => field(f, layout)).join('\n'), 8)}
    </StackPanel>
</Border>`;
}

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
${ind(header('LOCGameDetails', 'HeadingMarkerAltBrush', '0,0,0,4'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-8">
${ind(groups.map(g => group(g, layout)).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Border Margin="3" BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1" IsHitTestVisible="False" />
</Grid>`;
}

const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Height" Value="{DynamicResource GameBannerHeight}" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageBackground}" Value="Collapsed">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageBackground}" Value="{x:Null}">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.BackgroundImage}" Value="{x:Null}">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
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

const spacer = (ratio, fallback) => `<Border>
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='${ratio}'}" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding ActualHeight, ElementName=HeroArt}" Value="0">
                    <Setter Property="Height" Value="${fallback}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>`;

// Title with the game's function-name suffix: "Name" then a mint "()". WrapPanel passes its width down, so long
// names still wrap and the suffix follows the last word.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" Margin="0,0,12,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <WrapPanel VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                   FontWeight="Bold" Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />
        <TextBlock Text="()" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
                   FontWeight="Bold" Foreground="{DynamicResource TitleSuffixBrush}" Margin="2,0,0,0">
            <TextBlock.Style>
                <Style TargetType="TextBlock">
                    <Style.Triggers>
                        <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="">
                            <Setter Property="Visibility" Value="Collapsed" />
                        </DataTrigger>
                        <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="{x:Null}">
                            <Setter Property="Visibility" Value="Collapsed" />
                        </DataTrigger>
                    </Style.Triggers>
                </Style>
            </TextBlock.Style>
        </TextBlock>
    </WrapPanel>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid Width="150" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" />
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

const steam = `<ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,18">
    <ContentControl.Style>
        <Style TargetType="ContentControl">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </ContentControl.Style>
</ContentControl>
<Grid>
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <MultiDataTrigger>
                    <MultiDataTrigger.Conditions>
                        <Condition Binding="{Binding Game.PluginId}" Value="CB91DFC9-B977-43BF-8E70-55F46E410FAB" />
                        <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                    </MultiDataTrigger.Conditions>
                    <Setter Property="Visibility" Value="Visible" />
                </MultiDataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Border Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}" Visibility="Collapsed" Height="150" Margin="0,0,0,18"
            Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}" BorderThickness="1">
        <Border.Triggers>
            <EventTrigger RoutedEvent="Binding.TargetUpdated">
                <BeginStoryboard>
                    <Storyboard>
                        <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility">
                            <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                            <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                        </ObjectAnimationUsingKeyFrames>
                    </Storyboard>
                </BeginStoryboard>
            </EventTrigger>
        </Border.Triggers>
        <Grid x:Name="SkeletonCells" Margin="8">
            <Grid.ColumnDefinitions>
                <ColumnDefinition />
                <ColumnDefinition Width="8" />
                <ColumnDefinition />
            </Grid.ColumnDefinitions>
            <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" />
            <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" />
        </Grid>
    </Border>
</Grid>`;

const textColumn = `<StackPanel>
${ind(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${ind(header('LOCGameDescriptionTitle', 'HeadingMarkerAltBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrushDarker}" Tag="{DynamicResource GlyphBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${ind(header('LOCNotesLabel', 'HeadingMarkerBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrushDarker}" />
    </StackPanel>
</StackPanel>`;

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

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
                        <Grid x:Name="PageRoot" Background="{DynamicResource GameOverviewBackgroundBrush}" UseLayoutRounding="True">
${ind(heroArt, 28)}
                            <StackPanel Margin="28,0,28,28">
                                <StackPanel.Style>
                                    <Style TargetType="StackPanel">
                                        <Style.Triggers>
                                            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                                <Setter Property="Visibility" Value="Collapsed" />
                                            </DataTrigger>
                                        </Style.Triggers>
                                    </Style>
                                </StackPanel.Style>
${ind(spacer('x * 150 / 340', 28), 32)}
                                <DockPanel Margin="0,12,0,16">
${ind(actions('16,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${ind(title, 36)}
                                </DockPanel>
                                <Grid Margin="0,22,0,0">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="24" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${ind(textColumn, 36)}
${ind(pane('side', 'GameDetailsPaneWidth', '16,14,16,16').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
                                </Grid>
                            </StackPanel>
                            <!-- Empty state (no game selected): an empty upgrade-slot hexagon in the selection brackets with a pulsing diamond pip,
                                 Playnite's "No game selected", and a standby scan along a row of memory pips. Centered in the visible area; the
                                 loops run only while it shows (RemoveStoryboard on exit). -->
                            <Grid VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
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
                            </Grid>
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

const gridView = `<!--
    Cloudbank: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 120 / 340 (52 with no banner, room for the close
    button), title with the "()" suffix, actions under it, then text left and the DETAILS panel right
    (GridDetailsPaneWidth, 300 content width) with captions beside values. Close (CloseGameSideBarCommand) sits over the top-right corner.
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
                            <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                                <Grid x:Name="PageRoot" Background="{DynamicResource GameOverviewBackgroundBrush}" UseLayoutRounding="True">
${ind(heroArt, 36)}
                                    <StackPanel Margin="22,0,22,24">
                                        <StackPanel.Style>
                                            <Style TargetType="StackPanel">
                                                <Style.Triggers>
                                                    <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                    </DataTrigger>
                                                </Style.Triggers>
                                            </Style>
                                        </StackPanel.Style>
${ind(spacer('x * 120 / 340', 52), 40)}
                                        <StackPanel Margin="0,10,0,16">
${ind(title, 44)}
${ind(actions('0,14,0,0'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,20,0,0">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="24" />
                                                <ColumnDefinition Width="Auto" />
                                            </Grid.ColumnDefinitions>
${ind(textColumn, 44)}
${ind(pane('stack', 'GridDetailsPaneWidth', '14,12,14,14').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
                                        </Grid>
                                    </StackPanel>
                                    <!-- Empty state (no game selected): an empty upgrade-slot hexagon in the selection brackets with a pulsing diamond pip,
                                         Playnite's "No game selected", and a standby scan along a row of memory pips. Centered in the visible area; the
                                         loops run only while it shows (RemoveStoryboard on exit). -->
                                    <Grid VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
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
                                    </Grid>
                                </Grid>
                            </ScrollViewer>
                            <Button HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,12,18,0" Width="32" Height="32"
                                    Focusable="False" Cursor="Hand"
                                    Command="{MainViewModel CloseGameSideBarCommand}">
                                <Button.Template>
                                    <ControlTemplate TargetType="{x:Type Button}">
                                        <Border x:Name="Chrome" Background="{DynamicResource ButtonBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}"
                                                BorderThickness="1" CornerRadius="{DynamicResource ControlCornerRadius}">
                                            <ContentControl x:Name="Glyph" Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                                                            Foreground="{DynamicResource TextBrushDarker}" HorizontalAlignment="Center" VerticalAlignment="Center" />
                                        </Border>
                                        <ControlTemplate.Triggers>
                                            <Trigger Property="IsMouseOver" Value="True">
                                                <Setter TargetName="Chrome" Property="Background" Value="{DynamicResource DangerBrush}" />
                                                <Setter TargetName="Chrome" Property="BorderBrush" Value="{DynamicResource DangerBrush}" />
                                                <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
                                            </Trigger>
                                        </ControlTemplate.Triggers>
                                    </ControlTemplate>
                                </Button.Template>
                            </Button>
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeFileSync(join(out, 'Views', 'DetailsViewGameOverview.xaml'), details);
writeFileSync(join(out, 'Views', 'GridViewGameOverview.xaml'), gridView);
console.log('wrote both overviews');
