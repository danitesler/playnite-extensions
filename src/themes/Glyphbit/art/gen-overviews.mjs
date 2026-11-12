// Generates Glyphbit's two game pages from one field table, so both views stay in step.
// Usage: node src/themes/Glyphbit/art/gen-overviews.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyGamePageBreakpoints } from '../../../../scripts/game-page-breakpoints.mjs';

const out = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'Views');

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

function value(kind, part, extra = '') {
  switch (kind) {
    case 'button': return `<Button${extra} x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource PropertyItemButton}" />`;
    case 'text': return `<TextBlock${extra} x:Name="${part}" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="{DynamicResource TextBrush}" />`;
    case 'score': return `<TextBlock${extra} x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource TextBlockGameScore}" />`;
    default: return `<ItemsControl${extra} x:Name="${part}" Tag="${kind === 'chips' ? 'Chip' : ''}">
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <WrapPanel />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>`;
  }
}

const field = ([name, loc, kind, part]) => `<Border x:Name="PART_Elem${name}" Margin="0,8">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="2*" />
            <ColumnDefinition Width="12" />
            <ColumnDefinition Width="3*" />
        </Grid.ColumnDefinitions>
        <TextBlock Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" VerticalAlignment="Top" Margin="0,2,0,0" />
${ind(value(kind, part, ' Grid.Column="2"'), 8)}
    </Grid>
</Border>`;

function group([name, fields]) {
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
  return `<Border x:Name="${name}" Margin="0,12,0,0" Padding="0,12,0,0" BorderThickness="0,1,0,0" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
${ind(trig, 16)}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
${ind(fields.map(field).join('\n'), 8)}
    </StackPanel>
</Border>`;
}

// The metadata pane: a thin neon frame on black, a rune column inside its top-left corner and a white pip on the top right.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="2" Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-8">
${ind(groups.map(group).join('\n'), 20)}
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
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
    <Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="{DynamicResource GameBannerDarken}" IsHitTestVisible="False" />
    <!-- banner darkening floor: any value above 0 starts at 50%, so the result is 50% + 50% x the slider -->
    <Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="0.5" Tag="{DynamicResource GameBannerDarken}" IsHitTestVisible="False">
        <Rectangle.Style>
            <Style TargetType="Rectangle">
                <Style.Triggers>
                    <DataTrigger Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="0">
                        <Setter Property="Visibility" Value="Collapsed" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </Rectangle.Style>
    </Rectangle>
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
    <Grid Width="160" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" />
    </Grid>
${ind(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${ind(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;

const steam = `<Grid x:Name="SteamScreenshotsGameScope">
    <!-- Plugin visibility is shared: a late Steam load must never reveal a different game's section. -->
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game.PluginId}" Value="cb91dfc9-b977-43bf-8e70-55f46e410fab">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.Source.Name}" Value="Steam">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
<ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,18">
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
            Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1">
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
        <Control Template="{DynamicResource CornerMarksTemplate}" Focusable="False" IsTabStop="False" Margin="24" Foreground="{DynamicResource SlotBorderBrush}" />
    </Border>
</Grid>
</Grid>`;

// Description and notes carry no words above them, only a short stepped ramp: the page says as little as it can.
const ramp = `<Control Template="{DynamicResource PixelRampTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Width="96" Height="4" HorizontalAlignment="Left" Margin="0,0,0,12"
         Background="{DynamicResource HeadingMarkerBrush}" Foreground="{DynamicResource GlyphBrush}" />`;

const text = `<StackPanel>
${ind(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${ind(ramp, 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrushDarker}" Tag="{DynamicResource GlyphBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${ind(ramp, 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrushDarker}" />
    </StackPanel>
</StackPanel>`;

const noGameHide = (type) => `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${type}.Style>`;

// A loop that runs only while no game is selected. Plain properties only: Style triggers fire during template creation.
const idle = (type, name, body) => `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                <DataTrigger.EnterActions>
                    <BeginStoryboard x:Name="${name}">
                        <Storyboard RepeatBehavior="Forever">
${ind(body, 28)}
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
${ind(idle('Path', name, blink(times)), 4)}
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
${ind(idle('Path', 'ModulePulse', blink([['0', 1], ['1.8', 0.6], ['2.1', 0.8], ['2.4', 0.6], ['2.7', 0.8]])), 20)}
                </Path>
            </Canvas>
${ind(spark('SparkA', '30,34,0,0', [['0.4', 1], ['0.7', 0.4], ['1', 0]]), 12)}
${ind(spark('SparkB', '136,52,0,0', [['1.3', 1], ['1.6', 0.4], ['1.9', 0]]), 12)}
${ind(spark('SparkC', '48,134,0,0', [['2.2', 1], ['2.5', 0.4], ['2.8', 0]]), 12)}
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
${ind(idle('Rectangle', 'PipScan', `<ThicknessAnimationUsingKeyFrames Storyboard.TargetProperty="Margin" Duration="0:0:2">
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
                            <Grid.Style>
                                <Style TargetType="Grid">
                                    <Setter Property="Background" Value="{DynamicResource GameOverviewBackgroundBrush}" />
                                    <Style.Triggers>
                                        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                            <Setter Property="Background" Value="Transparent" />
                                        </DataTrigger>
                                    </Style.Triggers>
                                </Style>
                            </Grid.Style>
${ind(hero, 28)}
                            <StackPanel Margin="28,0,28,28">
${ind(noGameHide('StackPanel'), 32)}
${ind(gridSpacer(spacer('x * 170 / 320', 28), 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,8,0,20">
${ind(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${ind(title, 36)}
                                </DockPanel>
                                <Grid>
${ind(columns, 36)}
${ind(text, 36)}
${ind(pane('GameDetailsPaneWidth', '16,14,16,16'), 36)}
                                </Grid>
                            </StackPanel>
${ind(empty, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

function gridSpacer(markup, floor, name = 'GridBannerSpacer') {
  return markup.replace('<Border', '<Border x:Name="' + name + '" MinHeight="' + floor + '"')
    .replace(/(<Setter Property="Height" Value=")(\d+)(" \/>)/, (_, a, value, b) => a + floor + b)
    .replace('</Style.Triggers>', `<DataTrigger Binding="{Binding Visibility, ElementName=HeroArt}" Value="Collapsed"><Setter Property="Height" Value="$FLOOR" /></DataTrigger>
`.replace('$FLOOR', floor) + '</Style.Triggers>');
}

// Grid-only layout: retain each pane's markup while allowing metadata to move below it.
function responsiveBody(main, metadata, gap = 24, attrs = '') {
  const unposition = (text, role) => text.replace(/^<[^>]+>/, tag => tag.replace(/\s(?:Grid\.Column|Grid\.Row|DockPanel\.Dock)="[^"]*"/g, '').replace(/Margin="([^"]+)"/, (_, value) => { const m = value.split(','); if (m.length === 4) m[role === 'Metadata' ? 0 : 2] = '0'; return 'Margin="' + m.join(',') + '"'; }));
  metadata = unposition(metadata, 'Metadata').replace(/<(\w+)([^>]*?)\sWidth="\{DynamicResource GridDetailsPaneWidth\}"([^>]*)>/, (_, tag, before, after) => '<' + tag + before + after + ' x:Name="GridMetadataContent" MaxWidth="{DynamicResource GridDetailsPaneWidth}" Tag="{DynamicResource GridDetailsPaneWidth}">\n' + `<$TAG.Style><Style TargetType="$TAG">
    <Setter Property="Width" Value="{DynamicResource GridDetailsPaneWidth}" />
    <Style.Triggers><DataTrigger Binding="{Binding Tag, ElementName=GridOverviewBody}" Value="True"><Setter Property="Width" Value="NaN" /></DataTrigger></Style.Triggers>
</Style></$TAG.Style>`.replaceAll('$TAG', tag));
  main = unposition(main, 'Main');
  const column = (role, content) => `<Grid x:Name="Grid$ROLEColumn" VerticalAlignment="Top">
<Grid.Style><Style TargetType="Grid">
    <Setter Property="Grid.Column" Value="$COL" /><Setter Property="Grid.Row" Value="0" /><Setter Property="Grid.ColumnSpan" Value="1" />
    $MARGIN
    <Style.Triggers><DataTrigger Binding="{Binding Tag, ElementName=GridOverviewBody}" Value="True">
        <Setter Property="Grid.Column" Value="0" /><Setter Property="Grid.Row" Value="$ROW" /><Setter Property="Grid.ColumnSpan" Value="2" />
        $NARROWMARGIN
    </DataTrigger></Style.Triggers>
</Style></Grid.Style>
$WIDTH
$CONTENT
</Grid>`
    .replaceAll('$ROLE', role).replaceAll('$COL', role === 'Main' ? '0' : '1').replaceAll('$ROW', role === 'Main' ? '0' : '1')
    .replace('$MARGIN', role === 'Metadata' ? '<Setter Property="Margin" Value="' + gap + ',0,0,0" />' : '')
    .replace('$NARROWMARGIN', role === 'Metadata' ? '<Setter Property="Margin" Value="0,24,0,0" />' : '')
    .replace('$WIDTH', role === 'Main' ? `<Grid.MaxWidth><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="z == true ? x : Max(0, x - y - $GAP)">
    <Binding Path="ActualWidth" ElementName="GridOverviewBody" /><Binding Path="ActualWidth" ElementName="GridMetadataColumn" /><Binding Path="Tag" ElementName="GridOverviewBody" />
</MultiBinding></Grid.MaxWidth>` : '').replace('$CONTENT', content);
  return `<Grid x:Name="GridOverviewBody" $ATTRS>
<Grid.Tag><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="x &lt; y + $GAP + 400">
    <Binding Path="ActualWidth" RelativeSource="{RelativeSource Self}" /><Binding Path="Tag" ElementName="GridMetadataContent" />
</MultiBinding></Grid.Tag>
<Grid.ColumnDefinitions><ColumnDefinition Width="*" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions>
<Grid.RowDefinitions><RowDefinition Height="Auto" /><RowDefinition Height="Auto" /></Grid.RowDefinitions>
$MAIN
$META
</Grid>`.replace('$ATTRS', attrs).replace('$MAIN', column('Main', main)).replace('$META', column('Metadata', metadata)).replaceAll('$GAP', gap);
}

const gridTitle = title.replace('<DockPanel>', '<DockPanel Panel.ZIndex="2">').replace('    <Image', `    <Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center"
            Margin="0,0,10,0" Width="28" Height="28" Padding="0" Focusable="False" Cursor="Hand"
            ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}"
            Template="{Binding Template, ElementName=SidePanelCloseButton}"
            Visibility="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Visible\` : \`Collapsed\`'}">
                <Button.RenderTransform>
                    <TranslateTransform Y="{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}" />
                </Button.RenderTransform>
        </Button>\n    <Image`);

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
                                    <Grid.Style>
                                        <Style TargetType="Grid">
                                            <Setter Property="Background" Value="{DynamicResource GameOverviewBackgroundBrush}" />
                                            <Style.Triggers>
                                                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                    <Setter Property="Background" Value="Transparent" />
                                                </DataTrigger>
                                            </Style.Triggers>
                                        </Style>
                                    </Grid.Style>
${ind(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${ind(noGameHide('StackPanel'), 40)}
${ind(gridSpacer(spacer('x * 130 / 320', 14), 14), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,8,0,20">
${ind(gridTitle, 44)}
${ind(actions(' Margin="0,14,0,0"'), 44)}
                                        </StackPanel>
${ind(responsiveBody(text, pane('GridDetailsPaneWidth', '14,12,14,14'), 24, ""), 40)}
                                    </StackPanel>
${ind(empty, 36)}
                                </Grid>
                            </ScrollViewer>
                            <Button x:Name="SidePanelCloseButton" Tag="{DynamicResource GameBannerHeight}"

                                    HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
                                    Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}"
                                    Command="{MainViewModel CloseGameSideBarCommand}">
<Button.Style><Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
    <Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Collapsed\` : \`Visible\`'}" />
    <Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible" /></DataTrigger></Style.Triggers>
</Style></Button.Style>
                                <!-- Close: a 28x28 plate that reads at rest (the theme's button plate, a rim and a bright glyph) and turns the danger color on hover. -->
                                <Button.Template>
                                    <ControlTemplate TargetType="{x:Type Button}">
                                        <Grid Background="Transparent">
                                            <Border CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource ButtonBackgroundBrush}"
                                                    BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" IsHitTestVisible="False" />
                                            <Border x:Name="HoverPlate" CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                                            <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                                                            Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                                                            Foreground="{DynamicResource TextBrush}" />
                                        </Grid>
                                        <ControlTemplate.Triggers>
                                            <Trigger Property="IsMouseOver" Value="True">
                                                <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
                                                <Trigger.EnterActions>
                                                    <BeginStoryboard><Storyboard>
                                                        <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                                                    </Storyboard></BeginStoryboard>
                                                </Trigger.EnterActions>
                                                <Trigger.ExitActions>
                                                    <BeginStoryboard><Storyboard>
                                                        <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                                                    </Storyboard></BeginStoryboard>
                                                </Trigger.ExitActions>
                                            </Trigger>
                                            <Trigger Property="IsPressed" Value="True">
                                                <Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" />
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

const responsiveDetails = applyGamePageBreakpoints(details, 'Details');
const responsiveGrid = applyGamePageBreakpoints(grid, 'Grid');
writeFileSync(join(out, 'DetailsViewGameOverview.xaml'), responsiveDetails);
writeFileSync(join(out, 'GridViewGameOverview.xaml'), responsiveGrid);
console.log('wrote both overviews');
