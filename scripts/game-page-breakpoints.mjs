// Applies the same responsive layout rules to standalone theme XAML and generator output.
// Usage: node scripts/game-page-breakpoints.mjs <...ViewGameOverview.xaml> [...]
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const minMainWidth = 400;
const metadataGap = 24;
const twoColumnMinWidth = 560;
// HorizontalAlignment resource (a ThemeModifier dropdown) for the details view:
// Right (default, also Stretch or missing) keeps metadata right of the main
// column; Left mirrors it; Center puts it, at its preferred width, centred
// above the main column. Stacked, Left and Center put metadata first.
export const placementKey = 'GameDetailsPanePosition';
const legacyPlacementKeys = ['GameDetailsPaneOnLeft'];

// Keep untouched XAML verbatim, including namespace declarations and markup extensions.
function parse(source) {
  const root = { children: [] };
  const stack = [root];
  const tags = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
  for (const match of source.matchAll(tags)) {
    const token = match[0];
    if (token.startsWith('<!') || token.startsWith('<?')) continue;
    if (token.startsWith('</')) {
      const node = stack.pop();
      if (node?.tag !== token.slice(2, -1).trim()) throw new Error(`Unexpected closing tag: ${token}`);
      node.closeStart = match.index;
      node.end = match.index + token.length;
    } else {
      const node = { tag: /^<([^\s/>]+)/.exec(token)[1], start: match.index,
        openEnd: match.index + token.length, children: [], parent: stack.at(-1) };
      node.attrs = Object.fromEntries([...token.matchAll(/([^\s=<>]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(m => [m[1], m[3]]));
      node.parent.children.push(node);
      if (token.endsWith('/>')) node.end = node.closeStart = node.openEnd;
      else stack.push(node);
    }
  }
  if (stack.length !== 1) throw new Error('Unbalanced XAML');
  const nodes = [];
  const visit = node => { if (node.tag) nodes.push(node); node.children.forEach(visit); };
  visit(root);
  function render(node) {
    if (node.replacement !== undefined) return node.openUpdates ? opening(node.replacement, node.openUpdates) : node.replacement;
    let text = source.slice(node.start, node.end);
    for (const child of [...node.children].reverse()) {
      text = text.slice(0, child.start - node.start) + render(child) + text.slice(child.end - node.start);
    }
    return node.openUpdates ? opening(text, node.openUpdates) : text;
  }
  return { nodes, render };
}
const name = node => node.attrs['x:Name'] || node.attrs.Name;
const attr = (text, key, value) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\s+${escaped}\\s*=\\s*(?:"[^"]*"|'[^']*')`);
  if (value === null) return text.replace(pattern, '');
  if (pattern.test(text)) return text.replace(pattern, ` ${key}="${value}"`);
  return text.replace(/\s*\/?>$/, end => ` ${key}="${value}"${end}`);
};
function opening(text, updates) {
  const match = /^<(?:[^>"']|"[^"]*"|'[^']*')*>/.exec(text);
  let head = match[0];
  for (const [key, value] of Object.entries(updates)) head = attr(head, key, value);
  return head + text.slice(match[0].length);
}
const margin = value => {
  const parts = (value || '0').split(',').map(Number);
  return parts.length === 1 ? Array(4).fill(parts[0]) : parts.length === 2 ? [parts[0],parts[1],parts[0],parts[1]] : parts;
};
function addStyle(text, tag, setters, trigger) {
  const parsed = parse(text);
  const root = parsed.nodes[0];
  const ownStyle = root.children.find(n => n.tag === `${tag}.Style`);
  if (!ownStyle) {
    const end = root.openEnd;
    return text.slice(0, end) + `\n<${tag}.Style><Style TargetType="${tag}">${setters}<Style.Triggers>${trigger}</Style.Triggers></Style></${tag}.Style>` + text.slice(end);
  }
  const begin = ownStyle.start;
  const end = ownStyle.closeStart;
  let style = text.slice(begin, end);
  const triggers = style.indexOf('<Style.Triggers>');
  if (triggers >= 0) {
    style = style.slice(0, triggers) + setters + style.slice(triggers);
    style = style.replace('</Style.Triggers>', trigger + '</Style.Triggers>');
  } else style = style.replace('</Style>', `${setters}<Style.Triggers>${trigger}</Style.Triggers></Style>`);
  return text.slice(0, begin) + style + text.slice(end);
}
const setter = (property, value) => `<Setter Property="${property}" Value="${value}" />`;

export function applyGamePageBreakpoints(source, view) {
  const { nodes, render } = parse(source);
  const isDetails = nodes.some(node => node.tag === 'ControlTemplate' && node.attrs.TargetType?.includes('DetailsViewGameOverview'));
  const prefix = view || (isDetails ? 'Details' : 'Grid');
  if (nodes.some(n => name(n) === `${prefix}MetadataGroups`)) return prefix === 'Details' ? applyGamePagePlacement(source) : source;
  const widthKey = prefix === 'Details' ? 'GameDetailsPaneWidth' : 'GridDetailsPaneWidth';
  const resource = `{DynamicResource ${widthKey}}`;
  const widthNode = nodes.find(n => n.attrs.Width === resource || (n.attrs.Tag === resource && n.attrs.MaxWidth === resource));
  const description = nodes.find(n => name(n) === 'PART_HtmlDescription');
  const groups = nodes.filter(n => /^Meta(?:Progress|Scores|About|Tags|Library|Links)$/.test(name(n) || ''));
  if (!widthNode || !description || groups.length !== 6 || groups.some(n => n.parent !== groups[0].parent)) throw new Error('Expected one metadata width and six grouped sections');
  let body = widthNode.parent;
  while (body && !isAncestor(body, description)) body = body.parent;
  if (!body) throw new Error('Missing common overview body');
  const metaBranch = branch(body, widthNode);
  const mainBranch = branch(body, description);
  const existingMain = nodes.find(n => name(n) === `${prefix}MainColumn`);
  const bodyName = existingMain ? name(body) : `${prefix}OverviewBody`;
  if (!bodyName) throw new Error('Responsive body needs a name');

  // Below the cutoff, use one full-width group per line. At the cutoff and
  // above, fit two groups with a 24px gutter. Collapsed groups pack.
  const host = groups[0].parent;
  if (host.tag !== 'StackPanel') throw new Error('Expected metadata StackPanel');
  const hostName = `${prefix}MetadataGroups`;
  const viewport = host.parent;
  const viewportName = name(viewport) || `${prefix}MetadataViewport`;
  if (!name(viewport)) {
    viewport.attrs['x:Name'] = viewportName;
    viewport.openUpdates = { 'x:Name': viewportName };
  }
  const padding = margin(viewport.attrs.Padding);
  const border = margin(viewport.attrs.BorderThickness);
  const inset = padding[0] + padding[2] + border[0] + border[2];
  const usable = Number.isFinite(inset) && inset > 0 ? `Max(0, x - ${inset})` : 'x';
  const normalMargin = margin(host.attrs.Margin);
  const twoMargin = [...normalMargin]; twoMargin[2] -= metadataGap;
  for (const group of groups) {
    const normal = margin(group.attrs.Margin);
    const two = [...normal]; two[2] += metadataGap;
    let text = opening(render(group), { Margin: null });
    const end = parse(text).nodes[0].openEnd;
    const width = `<Border.Width><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="y == true ? Max(0, (${usable} - ${metadataGap}) / 2) : ${usable}"><Binding Path="ActualWidth" ElementName="${viewportName}" /><Binding Path="Tag" ElementName="${hostName}" /></MultiBinding></Border.Width>`;
    text = text.slice(0, end) + width + text.slice(end);
    text = addStyle(text, group.tag, setter('Margin', normal.join(',')),
      `<DataTrigger Binding="{Binding Tag, ElementName=${hostName}}" Value="True">${setter('Margin', two.join(','))}</DataTrigger>`);
    group.replacement = text;
  }
  // Rounding each half-width group up independently can make the second
  // group wrap onto its own row at fractional display scales.
  let hostText = opening(render(host), { Margin: null, 'x:Name': hostName, UseLayoutRounding: 'False' });
  hostText = hostText.replace(/^<StackPanel/, '<WrapPanel').replace(/<\/StackPanel>$/, '</WrapPanel>')
    .replaceAll('StackPanel.Resources', 'WrapPanel.Resources');
  const hostProperties = `<WrapPanel.Tag><Binding Path="ActualWidth" ElementName="${viewportName}" Converter="{StaticResource MathConverter}" ConverterParameter="${usable} &gt;= ${twoColumnMinWidth}" /></WrapPanel.Tag>`;
  hostText = hostText.replace(/^(<WrapPanel[^>]*>)/, `$1\n${hostProperties}`);
  host.replacement = addStyle(hostText, 'WrapPanel', setter('Margin', normalMargin.join(',')),
    `<DataTrigger Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="True">${setter('Margin', twoMargin.join(','))}</DataTrigger>`);

  // A stacked pane must release both fixed width constraints, or it remains
  // a narrow centered column even though its frame fills the available space.
  const widthName = name(widthNode) || `${prefix}MetadataContent`;
  const widthAttributes = { Width: null, MaxWidth: null, Tag: resource, HorizontalAlignment: 'Stretch' };
  if (!existingMain && !name(widthNode)) widthAttributes['x:Name'] = widthName;
  let widthText = opening(render(widthNode), widthAttributes);
  if (existingMain) {
    widthText = addStyle(widthText, widthNode.tag, setter('MaxWidth', resource),
      `<DataTrigger Binding="{Binding Tag, ElementName=${bodyName}}" Value="True">${setter('MaxWidth', 'Infinity')}</DataTrigger>`);
  } else {
    widthText = addStyle(widthText, widthNode.tag, setter('Width', resource) + setter('MaxWidth', resource),
      `<DataTrigger Binding="{Binding Tag, ElementName=${bodyName}}" Value="True">${setter('Width', 'NaN')}${setter('MaxWidth', 'Infinity')}</DataTrigger>`);
  }
  widthNode.replacement = widthText;
  if (!existingMain) {
    const children = body.children.filter(n => !n.tag.includes('.'));
    if (children.length !== 2 || metaBranch === mainBranch) throw new Error('Expected distinct main/metadata branches');
    const definitions = body.children.find(n => n.tag.endsWith('.ColumnDefinitions'));
    const definedGap = definitions?.children.length === 3 ? Number(definitions.children[1].attrs.Width) : 0;
    const metaMargin = margin(metaBranch.attrs.Margin);
    const gap = definedGap || metaMargin[0] || 24;
    metaMargin[0] = 0;
    const metaText = opening(render(metaBranch), { 'Grid.Column': null, 'Grid.Row': null, 'DockPanel.Dock': null, Margin: metaMargin.join(','), HorizontalAlignment: 'Stretch' });
    const mainText = opening(render(mainBranch), { 'Grid.Column': null, 'Grid.Row': null, 'DockPanel.Dock': null });
    const state = `{Binding Tag, ElementName=${bodyName}}`;
    const metaWrapper = [
      `<Grid x:Name="${prefix}MetadataColumn" VerticalAlignment="Top">`,
      '<Grid.Style><Style TargetType="Grid">',
      setter('Grid.Column', '1'), setter('Grid.Row', '0'), setter('Grid.ColumnSpan', '1'), setter('Margin', `${gap},0,0,0`),
      `<Style.Triggers><DataTrigger Binding="${state}" Value="True">`,
      setter('Grid.Column', '0'), setter('Grid.Row', '1'), setter('Grid.ColumnSpan', '2'), setter('Margin', '0,24,0,0'),
      `</DataTrigger></Style.Triggers></Style></Grid.Style>\n${metaText}\n</Grid>`,
    ].join('');
    const mainWrapper = [
      `<Grid x:Name="${prefix}MainColumn" VerticalAlignment="Top">`,
      '<Grid.Style><Style TargetType="Grid">', setter('Grid.Column', '0'),
      `<Style.Triggers><DataTrigger Binding="${state}" Value="True">`, setter('Grid.ColumnSpan', '2'),
      '</DataTrigger></Style.Triggers></Style></Grid.Style>',
      `<Grid.MaxWidth><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="z == true ? x : Max(0, x - y - ${gap})">`,
      `<Binding Path="ActualWidth" ElementName="${bodyName}" />`,
      `<Binding Path="ActualWidth" ElementName="${prefix}MetadataColumn" />`,
      `<Binding Path="Tag" ElementName="${bodyName}" />`,
      `</MultiBinding></Grid.MaxWidth>\n${mainText}\n</Grid>`,
    ].join('');
    let head = source.slice(body.start, body.openEnd).replace(/^<\w+/, '<Grid');
    head = attr(head, 'x:Name', bodyName);
    let properties = body.children.filter(n => n.tag.includes('.') && !n.tag.endsWith('.ColumnDefinitions') && !n.tag.endsWith('.RowDefinitions')).map(render).join('\n');
    properties = properties.replaceAll(`${body.tag}.`, 'Grid.');
    const widthBinding = `<Binding Path="Tag" ElementName="${widthName}" />`;
    const tag = `<Grid.Tag><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="x &lt; y + ${gap} + ${minMainWidth}"><Binding Path="ActualWidth" RelativeSource="{RelativeSource Self}" />${widthBinding}</MultiBinding></Grid.Tag>`;
    body.replacement = `${head}\n${properties}\n${tag}\n<Grid.ColumnDefinitions><ColumnDefinition Width="*" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions><Grid.RowDefinitions><RowDefinition Height="Auto" /><RowDefinition Height="Auto" /></Grid.RowDefinitions>\n${metaWrapper}\n${mainWrapper}\n</Grid>`;
  }
  let result = source.slice(0, body.start) + render(body) + source.slice(body.end);
  // Reserve the scrollbar's width so reflow cannot toggle the scrollbar and
  // move the same window back across the metadata breakpoint.
  const scroll = nodes.find(node => node.tag === 'ScrollViewer' && name(node) === 'PART_ScrollViewHost');
  if (!scroll || scroll.start > body.start) throw new Error('Expected a game page scroll host');
  const scrollOpening = attr(source.slice(scroll.start, scroll.openEnd), 'VerticalScrollBarVisibility', 'Visible');
  result = result.slice(0, scroll.start) + scrollOpening + result.slice(scroll.openEnd);
  return prefix === 'Details' ? applyGamePagePlacement(result) : result;
}

// Details view only: lets GameDetailsPanePosition move the metadata column.
// The body gets three columns (Auto | * | Auto): Left uses column 0, Right
// column 2, Center spans all three in row 0 above the main column. The flag
// is read through the metadata column's own Tag so layout tests that clone
// the body keep it. The main column's MaxWidth moves into its style so
// Center can release it. Upgrades files written for the old Boolean key.
export function applyGamePagePlacement(source) {
  const { nodes } = parse(source);
  const body = nodes.find(n => name(n) === 'DetailsOverviewBody');
  if (!body) throw new Error('Expected DetailsOverviewBody');
  const meta = body.children.find(n => name(n) === 'DetailsMetadataColumn');
  const main = body.children.find(n => name(n) === 'DetailsMainColumn');
  const columns = body.children.find(n => n.tag === 'Grid.ColumnDefinitions');
  if (!meta || !main || !columns) throw new Error('Expected details metadata/main columns');
  const flag = `{DynamicResource ${placementKey}}`;
  if (meta.attrs.Tag === flag) return source;
  if (meta.attrs.Tag && !legacyPlacementKeys.some(key => meta.attrs.Tag === `{DynamicResource ${key}}`)) throw new Error(`Unexpected metadata column Tag ${meta.attrs.Tag}`);
  const metaStyle = meta.children.find(n => n.tag === 'Grid.Style');
  const mainStyle = main.children.find(n => n.tag === 'Grid.Style');
  const mainMax = main.children.find(n => n.tag === 'Grid.MaxWidth');
  if (!metaStyle || !mainStyle || !mainMax) throw new Error('Expected generated column styles and main MaxWidth');
  const gapMatch = /Property="Margin" Value="(\d+(?:\.\d+)?),0,0,0"/.exec(source.slice(metaStyle.start, metaStyle.end));
  if (!gapMatch) throw new Error('Expected metadata column gap');
  const gap = gapMatch[1];
  const maxBinding = source.slice(mainMax.openEnd, mainMax.closeStart).trim();
  const stacked = '{Binding Tag, ElementName=DetailsOverviewBody}';
  const position = '{Binding Tag, RelativeSource={RelativeSource Self}}';
  const positionFromMain = '{Binding Tag, ElementName=DetailsMetadataColumn}';
  const when = (binding, value, setters) => `<DataTrigger Binding="${binding}" Value="${value}">${setters}</DataTrigger>`;
  const both = (side, sideBinding, setters) => `<MultiDataTrigger><MultiDataTrigger.Conditions><Condition Binding="${stacked}" Value="True" /><Condition Binding="${sideBinding}" Value="${side}" /></MultiDataTrigger.Conditions>${setters}</MultiDataTrigger>`;
  const top = setter('Grid.Row', '0') + setter('Margin', '0,0,0,24');
  const metaText = [
    '<Grid.Style><Style TargetType="Grid">',
    setter('Grid.Column', '2'), setter('Grid.Row', '0'), setter('Grid.ColumnSpan', '1'), setter('Margin', `${gap},0,0,0`), setter('HorizontalAlignment', 'Stretch'),
    '<Style.Triggers>',
    when(position, 'Left', setter('Grid.Column', '0') + setter('Margin', `0,0,${gap},0`)),
    when(position, 'Center', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3') + top + setter('HorizontalAlignment', 'Center')),
    when(stacked, 'True', setter('Grid.Column', '0') + setter('Grid.Row', '1') + setter('Grid.ColumnSpan', '3') + setter('Margin', '0,24,0,0')),
    both('Left', position, top),
    both('Center', position, top + setter('HorizontalAlignment', 'Stretch')),
    '</Style.Triggers></Style></Grid.Style>',
  ].join('');
  const mainText = [
    '<Grid.Style><Style TargetType="Grid">',
    setter('Grid.Column', '1'), setter('Grid.Row', '0'), setter('Grid.ColumnSpan', '1'),
    `<Setter Property="MaxWidth"><Setter.Value>${maxBinding}</Setter.Value></Setter>`,
    '<Style.Triggers>',
    when(stacked, 'True', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3')),
    both('Left', positionFromMain, setter('Grid.Row', '1')),
    when(positionFromMain, 'Center', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3') + setter('Grid.Row', '1') + setter('MaxWidth', 'Infinity')),
    '</Style.Triggers></Style></Grid.Style>',
  ].join('');
  const columnsText = '<Grid.ColumnDefinitions><ColumnDefinition Width="Auto" /><ColumnDefinition Width="*" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions>';
  const metaOpening = attr(source.slice(meta.start, meta.openEnd), 'Tag', flag);
  const edits = [
    [columns.start, columns.end, columnsText],
    [meta.start, meta.openEnd, metaOpening],
    [metaStyle.start, metaStyle.end, metaText],
    [mainStyle.start, mainStyle.end, mainText],
    [mainMax.start, mainMax.end, ''],
  ].sort((a, b) => b[0] - a[0]);
  let result = source;
  for (const [start, end, text] of edits) result = result.slice(0, start) + text + result.slice(end);
  return result;
}
function isAncestor(ancestor, node) {
  for (let current = node; current; current = current.parent) if (current === ancestor) return true;
  return false;
}
function branch(parent, node) {
  while (node.parent !== parent) node = node.parent;
  return node;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args[0] === '--stdin') {
    process.stdout.write(applyGamePageBreakpoints(readFileSync(0, 'utf8'), args[1]));
  } else {
    const outputs = args.map(path => [path, applyGamePageBreakpoints(readFileSync(path, 'utf8'))]);
    for (const [path, output] of outputs) {
      writeFileSync(path, output);
      console.log(`Applied game-page breakpoints: ${path}`);
    }
  }
}
