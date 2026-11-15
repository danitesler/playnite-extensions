// Generates Gilded Rift's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from one field table.
// Usage: node src/themes/GildedRift/art/gen-overviews.mjs src/themes/GildedRift/src
// Structure comes from the repo's validated overview skeleton (banner, proportional spacer, Steam gate, responsive body,
// six metadata groups, close button, empty state); every visual is Gilded Rift's: notched navy frame, diamond rules,
// caps-serif headings, the winged icon plate. Edit this file, then regenerate; never edit the views by hand.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyGamePageBreakpoints } from '../../../../scripts/game-page-breakpoints.mjs';

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
const R = key => `{DynamicResource ${key}}`;

// ---------------------------------------------------------------------------------------------------------------------
// Metadata pane. Fields: a 23px minimum row, the caption in TextBrushDarker 12px, the value in TextBrush 13px.
// ---------------------------------------------------------------------------------------------------------------------
function value(kind, part) {
  switch (kind) {
    case 'button': return `<Button x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="${R('PropertyItemButton')}" />`;
    case 'text': return `<TextBlock x:Name="${part}" VerticalAlignment="Center" TextWrapping="Wrap" FontSize="13" Foreground="${R('TextBrush')}" />`;
    // A score is a bordered pill: the rating colour (whatever TextBlockGameScore paints the number) as a 12% fill and a 50% edge.
    // Both tints read the number's own Foreground, so Positive / Mixed / Negative follow the style, and the layers are separate
    // elements so the opacity never touches the number.
    case 'score': return `<Grid HorizontalAlignment="Left" VerticalAlignment="Center">
    <Border Background="{Binding Foreground, ElementName=${part}}" Opacity="0.12" IsHitTestVisible="False" />
    <Border BorderBrush="{Binding Foreground, ElementName=${part}}" BorderThickness="1" Opacity="0.5" IsHitTestVisible="False" />
    <TextBlock x:Name="${part}" Style="${R('TextBlockGameScore')}" FontSize="${R('FontSizeSmall')}" Margin="7,1,7,2" />
</Grid>`;
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
const caption = (loc, extra) =>
  `<TextBlock Text="${R(loc)}" FontSize="${R('FontSizeSmall')}" Foreground="${R('TextBrushDarker')}" TextWrapping="Wrap" VerticalAlignment="Top"${extra || ' Margin="0,4,0,0"'} />`;
function field([name, loc, kind, part], layout) {
  if (layout === 'side') {
    return `<Border x:Name="PART_Elem${name}" MinHeight="23">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="96" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>
        ${caption(loc)}
        <Border Grid.Column="1" Margin="10,0,0,0">
${ind(value(kind, part), 12)}
        </Border>
    </Grid>
</Border>`;
  }
  const gridValue = kind === 'score'
    ? value(kind, part).replace('<Grid ', '<Grid Grid.Column="2" ')
    : value(kind, part).replace(' x:Name=', ' Grid.Column="2" x:Name=');
  return `<Border x:Name="PART_Elem${name}" MinHeight="23">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="2*" />
            <ColumnDefinition Width="12" />
            <ColumnDefinition Width="3*" />
        </Grid.ColumnDefinitions>
        ${caption(loc)}
${ind(gridValue, 8)}
    </Grid>
</Border>`;
}
// A group opens with the divider (DividerTemplate: a 6px diamond and a 1px rule fading to clear) between 4px margins, 17px in all.
// The wrapper pulls the whole panel up by that 17px inside a clipping Grid, so the first visible group draws no rule.
const DIVIDER_BLOCK = 17;
const divider = `<Control Template="${R('DividerTemplate')}" Foreground="${R('FrameBrush')}" Height="9" Margin="0,4,0,4" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />`;
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
  return `<Border x:Name="${gname}" Margin="0,0,0,0">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
${ind(trig, 16)}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
${ind(divider, 8)}
${ind(fields.map(f => field(f, layout)).join('\n'), 8)}
    </StackPanel>
</Border>`;
}
// A plate with its top-left and bottom-right corners cut by a fixed size, drawn as fills so nothing is painted in a page colour and
// the pane stays content-sized: two triangles in fixed corner cells, three rectangles for the rest. Stack three of them
// (inset 0 / 2 / 3) to get the 2px band, the 1px hairline and the navy fill with perfectly mitred cuts.
function notch(inset, cut, brush) {
  const c = cut;
  return `<Grid${inset ? ` Margin="${inset}"` : ''}>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="${c}" />
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="${c}" />
    </Grid.ColumnDefinitions>
    <Grid.RowDefinitions>
        <RowDefinition Height="${c}" />
        <RowDefinition Height="*" />
        <RowDefinition Height="${c}" />
    </Grid.RowDefinitions>
    <Path Data="M ${c},0 L ${c},${c} L 0,${c} Z" Fill="${brush}" />
    <Rectangle Grid.Column="1" Grid.ColumnSpan="2" Fill="${brush}" />
    <Rectangle Grid.Row="1" Grid.ColumnSpan="3" Fill="${brush}" />
    <Rectangle Grid.Row="2" Grid.ColumnSpan="2" Fill="${brush}" />
    <Path Grid.Row="2" Grid.Column="2" Data="M 0,0 L ${c},0 L 0,${c} Z" Fill="${brush}" />
</Grid>`;
}
// The pane: the notched frame (2px FrameBrush band, FrameInnerBrush hairline, NormalBrushDark fill, cuts 12 / 11 / 11) behind a Border whose
// padding is the 3px frame plus 19px of air, so the usable content width (the shared pane width key) is exactly the 300px of the spec.
function pane(layout, widthKey) {
  return `<Grid VerticalAlignment="Top">
    <Grid IsHitTestVisible="False">
${ind(notch(0, 12, R('FrameBrush')), 8)}
${ind(notch(2, 11, R('FrameInnerBrush')), 8)}
${ind(notch(3, 11, R('NormalBrushDark')), 8)}
    </Grid>
    <Border Padding="22,17,22,17">
        <StackPanel Width="${R(widthKey)}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-${DIVIDER_BLOCK},0,0">
${ind(groups.map(g => group(g, layout)).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
}

// ---------------------------------------------------------------------------------------------------------------------
// Banner. No OpacityMask on the art (masked art repainted behind the animated Play plate leaves dark seams on scaled displays): the
// fade is a plain gradient to the page colour (read from PageRoot's own brush, so ThemeModifier still applies), clear at 38% of the
// banner and solid at 96% like the preview. The clear stop is transparent BLACK (#00000000, the repo's convention for this fade):
// WPF interpolates gradients without premultiplying alpha, so the named Transparent (white) would haze the banner grey. It is the
// only colour literal in the overviews; every mask below uses the named Black / Transparent, where only the alpha counts.
// ---------------------------------------------------------------------------------------------------------------------
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Height" Value="${R('GameBannerHeight')}" />
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
    <Rectangle Fill="${R('GameBannerTintBrush')}" Opacity="${R('GameBannerDarken')}" IsHitTestVisible="False" />
    <!-- banner darkening floor: any value above 0 starts at 50%, so the result is 50% + 50% x the slider -->
    <Rectangle Fill="${R('GameBannerTintBrush')}" Opacity="0.5" Tag="${R('GameBannerDarken')}" IsHitTestVisible="False">
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
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.38" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.96" />
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
function gridSpacer(markup, floor, name = 'GridBannerSpacer') {
  return markup.replace('<Border', '<Border x:Name="' + name + '" MinHeight="' + floor + '"')
    .replace(/(<Setter Property="Height" Value=")(\d+)(" \/>)/, (_, a, value, b) => a + floor + b)
    .replace('</Style.Triggers>', `<DataTrigger Binding="{Binding Visibility, ElementName=HeroArt}" Value="Collapsed"><Setter Property="Height" Value="$FLOOR" /></DataTrigger>
`.replace('$FLOOR', floor) + '</Style.Triggers>');
}

// ---------------------------------------------------------------------------------------------------------------------
// Header: the winged icon plate, the game name in the caps serif with the diamond flourish under it, the actions.
// ---------------------------------------------------------------------------------------------------------------------
const hideWhenNoTitle = (type) => `<${type}.Style>
    <Style TargetType="${type}">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
            <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="{x:Null}">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</${type}.Style>`;
// The icon plate: a chamfered (top-left, bottom-right) frame of three stacked strokes, so the 2px gradient frame follows theme brushes:
// FrameBrush all round, BevelLightBrush fading out from the top-left, FrameInnerBrush fading in toward the bottom-right. The art sits in an
// inner plate clipped to the same chamfer, one pixel smaller. The whole plate collapses when the game has no icon.
function iconPlate(size, cut, margin) {
  const s = size;
  const outer = `M ${cut},1 L ${s - 1},1 L ${s - 1},${s - cut} L ${s - cut},${s - 1} L 1,${s - 1} L 1,${cut} Z`;
  const inner = s - 4;
  const k = cut - 1;
  const clip = `M ${k},0 L ${inner},0 L ${inner},${inner - k} L ${inner - k},${inner} L 0,${inner} L 0,${k} Z`;
  const ring = (brush, stops) => stops
    ? `<Path Data="${outer}" Stroke="${R(brush)}" StrokeThickness="2" StrokeLineJoin="Miter" IsHitTestVisible="False">
    <Path.OpacityMask>
        <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
${stops.map(([c, o]) => `            <GradientStop Color="${c}" Offset="${o}" />`).join('\n')}
        </LinearGradientBrush>
    </Path.OpacityMask>
</Path>`
    : `<Path Data="${outer}" Stroke="${R(brush)}" StrokeThickness="2" StrokeLineJoin="Miter" IsHitTestVisible="False" />`;
  return `<Grid x:Name="IconPlate" DockPanel.Dock="Left" Width="${s}" Height="${s}" Margin="${margin}" VerticalAlignment="Bottom">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageIcon}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.Icon}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Grid Margin="2" Width="${inner}" Height="${inner}" Clip="${clip}">
        <Rectangle Fill="${R('ShellBackgroundBrush')}" />
        <Image x:Name="PART_ImageIcon" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant" />
    </Grid>
${ind(ring('FrameBrush'), 4)}
${ind(ring('BevelLightBrush', [['Black', '0'], ['Black', '0.18'], ['Transparent', '0.6']]), 4)}
${ind(ring('FrameInnerBrush', [['Transparent', '0.45'], ['Black', '0.95']]), 4)}
</Grid>`;
}
// The title: the game name in Cinzel Bold (it draws lowercase as small capitals, so no text transform is needed) with a tight line box,
// and the flourish under it: DividerTemplate in GlyphBrush, 340px wide in the details view.
function titleStack(fontSize, lineHeight, flourishWidth, margin, vertical) {
  return `<StackPanel VerticalAlignment="${vertical}" Margin="${margin}">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="${R('HeadingFontFamily')}" FontWeight="Bold" FontSize="${fontSize}"
               LineHeight="${lineHeight}" LineStackingStrategy="BlockLineHeight" Foreground="${R('HeadingForegroundBrush')}" TextWrapping="Wrap" />
    <Control Template="${R('DividerTemplate')}" Foreground="${R('GlyphBrush')}" Width="${flourishWidth}" Height="9" HorizontalAlignment="Left" Margin="0,8,0,0" Focusable="False" IsTabStop="False" IsHitTestVisible="False">
${ind(hideWhenNoTitle('Control'), 8)}
    </Control>
</StackPanel>`;
}
// Actions: the winged Play plate (196x46, its wings overhang 16px each side, so the cell keeps a 16px margin there) with the context
// action stacked in the same cell, the running overlay last; More and Edit are 40x40 icon squares with tooltips, always visible.
const actions = (kind, margin) => {
  const tag = kind === 'grid' ? 'WrapPanel' : 'StackPanel';
  return `<${tag} Orientation="Horizontal" Margin="${margin}">
    <Grid Width="196" Height="46" Margin="16,0,16,0" VerticalAlignment="Center">
        <Button x:Name="PART_ButtonPlayAction" Style="${R('PlayButton')}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="${R('PlayButton')}" />
        <Control Style="${R('RunningActionIndicator')}" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="8,0,0,0" VerticalAlignment="Center" ToolTip="${R('LOCMoreAction')}">
        <ContentControl Content="${R('IconOptions')}" ContentTemplate="${R('IconTemplate')}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="10,0,0,0" VerticalAlignment="Center" ToolTip="${R('LOCEditGame')}">
        <ContentControl Content="${R('IconEdit')}" ContentTemplate="${R('IconTemplate')}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</${tag}>`;
};

// ---------------------------------------------------------------------------------------------------------------------
// Left column: Steam screenshots (gated), description and notes under heading rules.
// ---------------------------------------------------------------------------------------------------------------------
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
<ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,16">
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
    <Border Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}" Visibility="Collapsed" Height="128" Margin="0,0,0,16">
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
        <Grid x:Name="SkeletonCells">
            <Grid.ColumnDefinitions>
                <ColumnDefinition />
                <ColumnDefinition Width="10" />
                <ColumnDefinition />
                <ColumnDefinition Width="10" />
                <ColumnDefinition />
            </Grid.ColumnDefinitions>
            <Border Background="${R('NormalBrushDark')}" BorderBrush="${R('FrameInnerBrush')}" BorderThickness="1" CornerRadius="${R('ControlCornerRadius')}" />
            <Border Grid.Column="2" Background="${R('NormalBrushDark')}" BorderBrush="${R('FrameInnerBrush')}" BorderThickness="1" CornerRadius="${R('ControlCornerRadius')}" />
            <Border Grid.Column="4" Background="${R('NormalBrushDark')}" BorderBrush="${R('FrameInnerBrush')}" BorderThickness="1" CornerRadius="${R('ControlCornerRadius')}" />
        </Grid>
    </Border>
</Grid>
</Grid>`;

// Section heading: an 8px diamond, the Playnite caption in Cinzel Bold 13px, then a 1px rule fading to the right.
const header = (loc, margin = '0,0,0,8') => `<Grid Margin="${margin}">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <Path Data="M 4,0 L 8,4 L 4,8 L 0,4 Z" Fill="${R('HeadingMarkerBrush')}" Width="8" Height="8" Margin="0,0,12,0" VerticalAlignment="Center" IsHitTestVisible="False" />
    <TextBlock Grid.Column="1" FontFamily="${R('HeadingFontFamily')}" FontWeight="Bold" FontSize="13" Foreground="${R('HeadingForegroundBrush')}"
               VerticalAlignment="Center" TextTrimming="CharacterEllipsis" Text="${R(loc)}" />
    <Rectangle Grid.Column="2" Height="1" Margin="12,1,0,0" VerticalAlignment="Center" Fill="${R('HeadingRuleBrush')}" IsHitTestVisible="False">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="Black" Offset="0" />
                <GradientStop Color="Transparent" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;
const textColumn = `<StackPanel>
${ind(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${ind(header('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="${R('FontFamily')}" HtmlFontSize="13"
                      TextElement.Foreground="${R('TextBrushDarker')}" Tag="${R('LinkBrush')}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${ind(header('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="${R('BareTextBox')}" FontSize="13" Foreground="${R('TextBrushDarker')}" />
    </StackPanel>
</StackPanel>`;

// ---------------------------------------------------------------------------------------------------------------------
// Empty state: the crystal (EmptyGameTemplate draws it and runs its own idle loops only while visible) with the no-game line under it.
// Centred in the visible area. Nothing here animates; the template's loops are Opacity and StrokeDashOffset, never a RenderTransform.
// ---------------------------------------------------------------------------------------------------------------------
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
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,24" IsHitTestVisible="False">
        <Control Template="${R('EmptyGameTemplate')}" Foreground="${R('GlyphBrush')}" BorderBrush="${R('RunningIndicatorBrush')}" Background="${R('ShellBackgroundBrush')}"
                 Width="300" Height="300" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <TextBlock Text="${R('LOCErrorNoGameSelected')}" Margin="0,-34,0,0" HorizontalAlignment="Center" TextAlignment="Center" TextTrimming="CharacterEllipsis"
                   FontFamily="${R('HeadingFontFamily')}" FontWeight="Bold" FontSize="14" Foreground="${R('HeadingForegroundBrush')}" />
        <Control Template="${R('DividerTemplate')}" Foreground="${R('FrameBrush')}" Width="180" Height="9" Margin="0,10,0,0" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    </StackPanel>
</Grid>`;
const hideWhenEmpty = `<StackPanel.Style>
    <Style TargetType="StackPanel">
        <Style.Triggers>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</StackPanel.Style>`;

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib"`;

const pageRootStyle = `<Grid.Style>
    <Style TargetType="Grid">
        <Setter Property="Background" Value="${R('GameOverviewBackgroundBrush')}" />
        <Style.Triggers>
            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                <Setter Property="Background" Value="Transparent" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</Grid.Style>`;

// ---------------------------------------------------------------------------------------------------------------------
// Details view.
// ---------------------------------------------------------------------------------------------------------------------
const detailsHeader = `<DockPanel Margin="0,0,0,16">
${ind(actions('details', '18,0,0,2').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Bottom"'), 4)}
${ind(iconPlate(72, 8, '0,0,16,0'), 4)}
${ind(titleStack(34, 40, 340, '0,0,0,2', 'Bottom'), 4)}
</DockPanel>`;

const details = `<!--
    Gilded Rift: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 300) fading into the page from 38% to 96%;
    spacer x * 150 / 300 (28 floor, the page's side inset); the winged icon plate (72px), the game name in Cinzel Bold 34px
    with the diamond flourish under it and the actions beside it (the winged Play plate 196x46, More and Edit 40x40 icon
    squares with tooltips, always visible); then the screenshots, description and notes under diamond heading rules on the
    left and the notched metadata frame on the right (GameDetailsPaneWidth, 300 content width; rows 23px, group rules are
    DividerTemplate). Empty state: the crystal (EmptyGameTemplate) and the no-game line. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${ind(pageRootStyle, 28)}
${ind(heroArt, 28)}
                            <StackPanel Margin="28,0,28,28">
${ind(hideWhenEmpty, 32)}
${ind(gridSpacer(spacer('x * 150 / 300', 28), 28, 'DetailsBannerSpacer'), 32)}
${ind(detailsHeader, 32)}
                                <Grid Margin="0,0,0,0">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="24" />
                                        <ColumnDefinition Width="Auto" />
                                    </Grid.ColumnDefinitions>
${ind(textColumn, 36)}
${ind(pane('side', 'GameDetailsPaneWidth').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
                                </Grid>
                            </StackPanel>
${ind(emptyState, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

// ---------------------------------------------------------------------------------------------------------------------
// Grid side panel. Grid-only layout: retain each pane's markup while allowing metadata to move below it.
// ---------------------------------------------------------------------------------------------------------------------
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

// The inline close sits left of the icon below 120px of banner (or while Playnite draws the art behind the window). It shares the corner
// button's template, is pinned to the physical scroll offset, and stacks above the scrolling content.
const gridHeader = `<DockPanel Panel.ZIndex="2">
    <Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center"
            Margin="0,0,10,0" Width="28" Height="28" Padding="0" Focusable="False" Cursor="Hand"
            ToolTip="${R('LOCCloseLabel')}" Command="{MainViewModel CloseGameSideBarCommand}"
            Template="{Binding Template, ElementName=SidePanelCloseButton}">
        <Button.Style>
            <Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
                <Setter Property="Visibility" Value="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Visible\` : \`Collapsed\`'}" />
                <Style.Triggers>
                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                        <Setter Property="Visibility" Value="Visible" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </Button.Style>
        <Button.RenderTransform>
            <TranslateTransform Y="{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}" />
        </Button.RenderTransform>
    </Button>
${ind(iconPlate(56, 7, '0,0,14,0').replace(' VerticalAlignment="Bottom"', ' VerticalAlignment="Center"'), 4)}
${ind(titleStack(28, 32, 240, '0', 'Center'), 4)}
</DockPanel>`;

const gridView = `<!--
    Gilded Rift: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 100 / 300 (14 floor), the icon plate (56px) and the game
    name in Cinzel Bold 28px with the flourish, actions under it, then text left and the notched metadata frame right
    (GridDetailsPaneWidth, 300 content width) with captions beside values. Close (CloseGameSideBarCommand) is a 28x28 notched plate
    that sits before the icon below 120px banner height, otherwise at the top-left corner, and is always in the empty
    state's corner. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="${R('PanelSeparatorBrush')}">
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
${ind(pageRootStyle, 36)}
${ind(heroArt, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${ind(hideWhenEmpty, 40)}
${ind(gridSpacer(spacer('x * 100 / 300', 14), 14), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
${ind(gridHeader, 44)}
${ind(actions('grid', '0,16,0,0'), 44)}
                                        </StackPanel>
${ind(responsiveBody(textColumn, pane('stack', 'GridDetailsPaneWidth').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 24, 'Margin="0,4,0,0"'), 40)}
                                    </StackPanel>
${ind(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
                            <Button x:Name="SidePanelCloseButton" Tag="${R('GameBannerHeight')}"

                                    HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
                                    Focusable="False" Cursor="Hand" ToolTip="${R('LOCCloseLabel')}"
                                    Command="{MainViewModel CloseGameSideBarCommand}">
<Button.Style><Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
    <Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Collapsed\` : \`Visible\`'}" />
    <Style.Triggers>
            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible" /></DataTrigger></Style.Triggers>
</Style></Button.Style>
                                <!-- Close: a 28x28 plate with its top-left and bottom-right corners cut 5px. It reads at rest (ButtonBackgroundBrush fill, a NormalBorderBrush
                                     rim, a 14px TextBrush glyph) and has an animated hover: a DangerBrush plate fades in over 0.12s and the glyph turns DangerForegroundBrush. -->
                                <Button.Template>
                                    <ControlTemplate TargetType="{x:Type Button}">
                                        <Grid Background="Transparent">
                                            <Path Data="M 5.5,0.5 L 27.5,0.5 L 27.5,22.5 L 22.5,27.5 L 0.5,27.5 L 0.5,5.5 Z" Fill="${R('ButtonBackgroundBrush')}"
                                                  Stroke="${R('NormalBorderBrush')}" StrokeThickness="1" StrokeLineJoin="Miter" IsHitTestVisible="False" />
                                            <Path x:Name="HoverPlate" Data="M 5.5,0.5 L 27.5,0.5 L 27.5,22.5 L 22.5,27.5 L 0.5,27.5 L 0.5,5.5 Z" Fill="${R('DangerBrush')}"
                                                  Opacity="0" IsHitTestVisible="False" />
                                            <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                                                            Content="${R('IconWindowClose')}" ContentTemplate="${R('IconTemplate')}"
                                                            Foreground="${R('TextBrush')}" />
                                        </Grid>
                                        <ControlTemplate.Triggers>
                                            <Trigger Property="IsMouseOver" Value="True">
                                                <Setter TargetName="Glyph" Property="Foreground" Value="${R('DangerForegroundBrush')}" />
                                                <Trigger.EnterActions>
                                                    <BeginStoryboard><Storyboard>
                                                        <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                                                    </Storyboard></BeginStoryboard>
                                                </Trigger.EnterActions>
                                                <Trigger.ExitActions>
                                                    <BeginStoryboard><Storyboard>
                                                        <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.2" />
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
const responsiveGrid = applyGamePageBreakpoints(gridView, 'Grid');
mkdirSync(join(out, 'Views'), { recursive: true });
writeFileSync(join(out, 'Views', 'DetailsViewGameOverview.xaml'), responsiveDetails);
writeFileSync(join(out, 'Views', 'GridViewGameOverview.xaml'), responsiveGrid);
console.log('wrote both overviews');
