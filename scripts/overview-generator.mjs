// Shared building blocks for theme art/gen-overviews.mjs scripts.
import { writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyGamePageBreakpoints } from './game-page-breakpoints.mjs';

export const META_GROUPS = [
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

export const indent = (s, n) => s.split('\n').map(l => (l ? ' '.repeat(n) + l : l)).join('\n');

export function resolveThemeSrcDir(metaUrl, argv = process.argv) {
  const arg = argv[2];
  if (arg) {
    const resolved = resolve(arg);
    if (basename(resolved) === 'Views') {
      throw new Error(`Pass the theme src dir (not Views/): ${arg}`);
    }
    return resolved;
  }
  return join(dirname(fileURLToPath(metaUrl)), '..', 'src');
}

export function collapseEmptyTrigger(elementNames, { inline = false } = {}) {
  if (elementNames.length === 1) {
    const open = `<DataTrigger Binding="{Binding Visibility, ElementName=${elementNames[0]}}" Value="Collapsed">`;
    const setter = '<Setter Property="Visibility" Value="Collapsed" />';
    return inline ? `${open}${setter}</DataTrigger>` : `${open}\n    ${setter}\n</DataTrigger>`;
  }
  const conds = elementNames.map(n => `<Condition Binding="{Binding Visibility, ElementName=${n}}" Value="Collapsed" />`);
  if (inline) {
    return `<MultiDataTrigger><MultiDataTrigger.Conditions>${conds.join('')}</MultiDataTrigger.Conditions><Setter Property="Visibility" Value="Collapsed" /></MultiDataTrigger>`;
  }
  return `<MultiDataTrigger>\n    <MultiDataTrigger.Conditions>\n${indent(conds.join('\n'), 8)}\n    </MultiDataTrigger.Conditions>\n    <Setter Property="Visibility" Value="Collapsed" />\n</MultiDataTrigger>`;
}

export function metadataValue(kind, part, extra = '') {
  switch (kind) {
    case 'button': return `<Button${extra} x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource PropertyItemButton}" />`;
    case 'text': return `<TextBlock${extra} x:Name="${part}" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="{DynamicResource TextBrush}" />`;
    case 'score': return `<TextBlock${extra} x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource TextBlockGameScore}" />`;
    case 'items':
    case 'chips':
      return `<ItemsControl${extra} x:Name="${part}" Tag="${kind === 'chips' ? 'Chip' : ''}">
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <WrapPanel />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>`;
  }
}

export const bannerSpacer = (ratio, fallback) => `<Border>
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

export const hideWhenNoTitle = (type) => `<${type}.Style>
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

export function writeOverviews(srcDir, detailsXml, gridXml) {
  const viewsDir = join(srcDir, 'Views');
  writeFileSync(join(viewsDir, 'DetailsViewGameOverview.xaml'), applyGamePageBreakpoints(detailsXml, 'Details'), 'utf8');
  writeFileSync(join(viewsDir, 'GridViewGameOverview.xaml'), applyGamePageBreakpoints(gridXml, 'Grid'), 'utf8');
}
