// Applies the same responsive layout rules to standalone theme XAML and generator output.
// Usage: node scripts/game-page-breakpoints.mjs <...ViewGameOverview.xaml> [...]
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const minMainWidth = 400;
const metadataGap = 24;
const twoColumnMinWidth = 560;
const threeColumnMinWidth = 900;
// HorizontalAlignment resource (a ThemeModifier dropdown) for both views:
// Right (default or missing) keeps metadata right of the main column; Left
// mirrors it; Center and Stretch stretch metadata full-width above the main
// column and hide group dividers so every visible item flows sequentially in a
// 3/2/1-column grid (1 < 560, 2 at 560+, 3 at 900+). Stacked, Left, Center and
// Stretch put metadata first.
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

const itemWidthMarkup = (tag, viewportName, usable) =>
  `<${tag}.Width><Binding Path="ActualWidth" ElementName="${viewportName}" Converter="{StaticResource MathConverter}" ConverterParameter="${usable} &gt;= ${threeColumnMinWidth} ? Max(0, (${usable} - ${metadataGap * 2}) / 3) : (${usable} &gt;= ${twoColumnMinWidth} ? Max(0, (${usable} - ${metadataGap}) / 2) : ${usable})" /></${tag}.Width>`;

const separatorWidthMarkup = (viewportName, usable) =>
  usable === 'x'
    ? `<Border.Width><Binding Path="ActualWidth" ElementName="${viewportName}" /></Border.Width>`
    : `<Border.Width><Binding Path="ActualWidth" ElementName="${viewportName}" Converter="{StaticResource MathConverter}" ConverterParameter="${usable}" /></Border.Width>`;

const isMetaGroup = node => /^Meta(?:Progress|Scores|About|Tags|Library|Links)$/.test(name(node) || '');
const isMetaElem = node => (name(node) || '').startsWith('PART_Elem');

function readMarginFromStyle(styleText) {
  const match = /<Setter\s+Property="Margin"\s+Value="([^"]+)"/.exec(styleText);
  return match ? margin(match[1]) : null;
}

function stripElemsFromDecor(source, node) {
  if (node.tag.includes('.') || isMetaElem(node)) return '';
  const hasElemDescendant = (n) => n.children.some(c => !c.tag.includes('.') && (isMetaElem(c) || hasElemDescendant(c)));
  if (!hasElemDescendant(node)) return source.slice(node.start, node.end);
  const keptChildren = [];
  for (const child of node.children) {
    if (child.tag.includes('.')) keptChildren.push(source.slice(child.start, child.end));
    else {
      const stripped = stripElemsFromDecor(source, child);
      if (stripped) keptChildren.push(stripped);
    }
  }
  const hasVisual = node.children.some(c => !c.tag.includes('.') && stripElemsFromDecor(source, c));
  if (!hasVisual) return '';
  if (node.tag === 'StackPanel') return keptChildren.join('\n');
  return source.slice(node.start, node.openEnd) + '\n' + keptChildren.join('\n') + `\n</${node.tag}>`;
}

function buildSeparatorBorder(source, group, viewportName, usable, prefix, flipBottomToTop) {
  const widthProp = group.children.find(n => n.tag === 'Border.Width');
  const styleProp = group.children.find(n => n.tag === 'Border.Style');
  const styleText = styleProp ? source.slice(styleProp.start, styleProp.end) : '';
  const basedOnMatch = /BasedOn="([^"]+)"/.exec(styleText);
  const basedOnAttr = basedOnMatch ? ` BasedOn="${basedOnMatch[1]}"` : '';
  const rawMargin = group.attrs.Margin !== undefined ? margin(group.attrs.Margin) : (readMarginFromStyle(styleText) || [0, 0, 0, 0]);
  const sepMargin = [...rawMargin];
  sepMargin[2] = 0;
  if (flipBottomToTop && sepMargin[1] === 0 && sepMargin[3] > 0) {
    sepMargin[1] = sepMargin[3];
    sepMargin[3] = 0;
  }
  const extraSetters = [];
  const styleHeader = styleText.split('<Style.Triggers>')[0];
  for (const m of styleHeader.matchAll(/<Setter\s+Property="([^"]+)"\s+Value="([^"]+)"\s*\/>/g)) {
    if (m[1] !== 'Margin' && m[1] !== 'Visibility') extraSetters.push(m[0]);
  }
  const collapseTriggers = [];
  if (styleProp) {
    const triggersNode = styleProp.children[0]?.children.find(n => n.tag === 'Style.Triggers');
    if (triggersNode) {
      for (const trig of triggersNode.children) {
        const trigSlice = source.slice(trig.start, trig.end);
        if (trigSlice.includes('PART_Elem')) collapseTriggers.push(trigSlice);
      }
    }
  }
  const centerTrigger = `<DataTrigger Binding="{Binding Tag, ElementName=${prefix}MetadataColumn}" Value="Center"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>`;
  const stretchTrigger = `<DataTrigger Binding="{Binding Tag, ElementName=${prefix}MetadataColumn}" Value="Stretch"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>`;
  const newStyle = `<Border.Style><Style TargetType="Border"${basedOnAttr}>${extraSetters.join('')}${setter('Margin', sepMargin.join(','))}<Style.Triggers>${collapseTriggers.join('')}${centerTrigger}${stretchTrigger}</Style.Triggers></Style></Border.Style>`;
  const preservedParts = [];
  for (const child of group.children) {
    if (child === widthProp || child === styleProp) continue;
    const text = child.tag.includes('.')
      ? source.slice(child.start, child.end)
      : stripElemsFromDecor(source, child);
    if (text) preservedParts.push(text);
  }
  const openTag = attr(source.slice(group.start, group.openEnd), 'Margin', null).replace(/\s*\/>$/, '>');
  return `${openTag}${separatorWidthMarkup(viewportName, usable)}\n${newStyle}${preservedParts.length ? '\n' + preservedParts.join('\n') : ''}\n</Border>`;
}

function buildItemElement(source, elem, hostName, viewportName, usable) {
  const widthProp = elem.children.find(n => n.tag === `${elem.tag}.Width`);
  const styleProp = elem.children.find(n => n.tag === `${elem.tag}.Style`);
  const styleText = styleProp ? source.slice(styleProp.start, styleProp.end) : '';
  const normalMargin = elem.attrs.Margin !== undefined ? margin(elem.attrs.Margin) : (readMarginFromStyle(styleText) || [0, 0, 0, 0]);
  const twoMargin = [...normalMargin];
  twoMargin[2] += metadataGap;
  const newStyle = `<${elem.tag}.Style><Style TargetType="${elem.tag}">${setter('Margin', normalMargin.join(','))}<Style.Triggers><DataTrigger Binding="{Binding Tag, ElementName=${hostName}}" Value="True">${setter('Margin', twoMargin.join(','))}</DataTrigger></Style.Triggers></Style></${elem.tag}.Style>`;
  // Keep the element content intact while replacing its layout properties.
  let elemText = source.slice(elem.start, elem.end);
  const removals = [widthProp, styleProp].filter(Boolean).sort((a, b) => b.start - a.start);
  for (const rem of removals) {
    elemText = elemText.slice(0, rem.start - elem.start) + elemText.slice(rem.end - elem.start);
  }
  elemText = opening(elemText, { Margin: null, VerticalAlignment: 'Top' });
  const openMatch = /^<(?:[^>"']|"[^"]*"|'[^']*')*>/.exec(elemText);
  const head = openMatch[0];
  const body = elemText.slice(head.length);
  return `${head}${itemWidthMarkup(elem.tag, viewportName, usable)}${newStyle}${body}`;
}

function applyMetadataItemsLayout(source, prefix) {
  const { nodes } = parse(source);
  const hostName = `${prefix}MetadataGroups`;
  const host = nodes.find(n => name(n) === hostName);
  if (!host) return source;
  const hostTag = host.children.find(n => n.tag === 'WrapPanel.Tag');
  const tagSlice = hostTag ? source.slice(hostTag.openEnd, hostTag.closeStart) : '';
  const viewportMatch = /ElementName="([^"]+)"/.exec(tagSlice);
  const usableMatch = /ConverterParameter="(.+?)\s*&gt;=/.exec(tagSlice);
  const viewportName = viewportMatch ? viewportMatch[1] : `${prefix}MetadataViewport`;
  const usable = usableMatch ? usableMatch[1] : 'x';
  const groups = host.children.filter(isMetaGroup);
  if (groups.length !== 6) return source;

  // Partition children into (group, elems[]) pairs whether currently nested or already flat.
  const sections = [];
  const directElems = host.children.filter(isMetaElem);
  if (directElems.length === 0) {
    for (const group of groups) {
      const elems = [];
      const collect = (n) => {
        for (const c of n.children) {
          if (c.tag.includes('.')) continue;
          if (isMetaElem(c)) elems.push(c);
          else collect(c);
        }
      };
      collect(group);
      sections.push({ group, elems });
    }
  } else {
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const next = groups[i + 1];
      const elems = host.children.filter(c => isMetaElem(c) && c.start > g.end && (!next || c.end < next.start));
      sections.push({ group: g, elems });
    }
  }

  // Detect Questlog-style bottom-only group margin so we flip it to top margin cleanly.
  const firstGroup = groups[0];
  const firstGroupStyle = firstGroup.children.find(n => n.tag === 'Border.Style');
  const firstGroupMargin = firstGroup.attrs.Margin !== undefined
    ? margin(firstGroup.attrs.Margin)
    : (readMarginFromStyle(firstGroupStyle ? source.slice(firstGroupStyle.start, firstGroupStyle.end) : '') || [0, 0, 0, 0]);
  const hasGroupBorder = (firstGroup.attrs.BorderThickness && margin(firstGroup.attrs.BorderThickness).some(v => v > 0))
    || (firstGroupStyle && /Property="BorderThickness"/.test(source.slice(firstGroupStyle.start, firstGroupStyle.end)));
  const hasGroupPadding = firstGroup.attrs.Padding && margin(firstGroup.attrs.Padding).some(v => v > 0);
  const flipBottomToTop = !hasGroupBorder && !hasGroupPadding && firstGroupMargin[1] === 0 && firstGroupMargin[3] > 0;
  const flippedGap = flipBottomToTop ? firstGroupMargin[3] : 0;

  // Compute WrapPanel margins (non-Stretch vs Stretch).
  const hostStyleProp = host.children.find(n => n.tag === 'WrapPanel.Style');
  const hostStyleSlice = hostStyleProp ? source.slice(hostStyleProp.start, hostStyleProp.end) : '';
  const normalMargin = hostStyleProp ? (readMarginFromStyle(hostStyleSlice) || [0, 0, 0, 0]) : margin(host.attrs.Margin);
  if (flippedGap > 0) {
    normalMargin[1] -= flippedGap;
    normalMargin[3] += flippedGap;
  }
  const twoMargin = [...normalMargin];
  twoMargin[2] -= metadataGap;
  const sampleElem = sections.flatMap(s => s.elems)[0];
  const sampleElemStyle = sampleElem?.children.find(n => n.tag === `${sampleElem.tag}.Style`);
  const elemMargin = sampleElem
    ? (sampleElem.attrs.Margin !== undefined ? margin(sampleElem.attrs.Margin) : (readMarginFromStyle(sampleElemStyle ? source.slice(sampleElemStyle.start, sampleElemStyle.end) : '') || [0, 0, 0, 0]))
    : [0, 0, 0, 0];
  const stretchNormalMargin = [normalMargin[0], -elemMargin[1], normalMargin[2], -elemMargin[3]];
  const stretchTwoMargin = [normalMargin[0], -elemMargin[1], normalMargin[2] - metadataGap, -elemMargin[3]];
  const newHostStyle = `<WrapPanel.Style><Style TargetType="WrapPanel">${setter('Margin', normalMargin.join(','))}<Style.Triggers><DataTrigger Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="True">${setter('Margin', twoMargin.join(','))}</DataTrigger><DataTrigger Binding="{Binding Tag, ElementName=${prefix}MetadataColumn}" Value="Center">${setter('Margin', stretchNormalMargin.join(','))}</DataTrigger><MultiDataTrigger><MultiDataTrigger.Conditions><Condition Binding="{Binding Tag, ElementName=${prefix}MetadataColumn}" Value="Center" /><Condition Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="True" /></MultiDataTrigger.Conditions>${setter('Margin', stretchTwoMargin.join(','))}</MultiDataTrigger><DataTrigger Binding="{Binding Tag, ElementName=${prefix}MetadataColumn}" Value="Stretch">${setter('Margin', stretchNormalMargin.join(','))}</DataTrigger><MultiDataTrigger><MultiDataTrigger.Conditions><Condition Binding="{Binding Tag, ElementName=${prefix}MetadataColumn}" Value="Stretch" /><Condition Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="True" /></MultiDataTrigger.Conditions>${setter('Margin', stretchTwoMargin.join(','))}</MultiDataTrigger></Style.Triggers></Style></WrapPanel.Style>`;

  const flattenedParts = [];
  for (const { group, elems } of sections) {
    flattenedParts.push(buildSeparatorBorder(source, group, viewportName, usable, prefix, flipBottomToTop));
    for (const elem of elems) {
      flattenedParts.push(buildItemElement(source, elem, hostName, viewportName, usable));
    }
  }
  const flattenedText = flattenedParts.join('\n');
  const visualChildren = host.children.filter(c => !c.tag.includes('.'));
  const rangeStart = visualChildren[0].start;
  const rangeEnd = visualChildren[visualChildren.length - 1].end;

  const edits = [];
  if (hostStyleProp && source.slice(hostStyleProp.start, hostStyleProp.end) !== newHostStyle) {
    edits.push([hostStyleProp.start, hostStyleProp.end, newHostStyle]);
  }
  if (source.slice(rangeStart, rangeEnd) !== flattenedText) {
    edits.push([rangeStart, rangeEnd, flattenedText]);
  }
  if (!edits.length) return source;
  edits.sort((a, b) => b[0] - a[0]);
  let result = source;
  for (const [start, end, text] of edits) result = result.slice(0, start) + text + result.slice(end);
  return result;
}

export function applyGamePageBreakpoints(source, view) {
  const { nodes, render } = parse(source);
  const isDetails = nodes.some(node => node.tag === 'ControlTemplate' && node.attrs.TargetType?.includes('DetailsViewGameOverview'));
  const prefix = view || (isDetails ? 'Details' : 'Grid');
  if (nodes.some(n => name(n) === `${prefix}MetadataGroups`)) {
    const updated = applyMetadataItemsLayout(source, prefix);
    return applyGamePagePlacement(updated, prefix);
  }
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
    const width = separatorWidthMarkup(viewportName, usable);
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
  return applyGamePagePlacement(applyMetadataItemsLayout(result, prefix), prefix);
}

// Both views: lets GameDetailsPanePosition move the metadata column.
// The body gets three columns (Auto | * | Auto): Left uses column 0, Right
// column 2, Center and Stretch span all three in row 0 and stretch full-width
// above the main column with flat item-by-item grid flow. The flag is read
// through the metadata column's own Tag so layout tests that clone the body
// keep it. Upgrades files written for older layouts.
export function applyGamePagePlacement(source, prefix = 'Details') {
  const { nodes } = parse(source);
  const metaName = `${prefix}MetadataColumn`;
  const mainName = `${prefix}MainColumn`;
  const widthKey = prefix === 'Details' ? 'GameDetailsPaneWidth' : 'GridDetailsPaneWidth';
  const meta = nodes.find(n => name(n) === metaName);
  const main = nodes.find(n => name(n) === mainName);
  const body = meta?.parent;
  const bodyName = body ? name(body) : '';
  const columns = body?.children.find(n => n.tag === 'Grid.ColumnDefinitions');
  if (!meta || !main || !body || body !== main.parent || !bodyName || !columns) {
    throw new Error(`Expected ${prefix.toLowerCase()} metadata/main columns`);
  }
  const flag = `{DynamicResource ${placementKey}}`;
  if (meta.attrs.Tag && meta.attrs.Tag !== flag && !legacyPlacementKeys.some(key => meta.attrs.Tag === `{DynamicResource ${key}}`)) {
    throw new Error(`Unexpected metadata column Tag ${meta.attrs.Tag}`);
  }
  const metaStyle = meta.children.find(n => n.tag === 'Grid.Style');
  const mainStyle = main.children.find(n => n.tag === 'Grid.Style');
  const mainMax = main.children.find(n => n.tag === 'Grid.MaxWidth');
  const widthNode = nodes.find(n => isAncestor(meta, n) && n.attrs.Tag === `{DynamicResource ${widthKey}}`);
  const widthStyle = widthNode?.children.find(n => n.tag === `${widthNode.tag}.Style`);
  if (!metaStyle || !mainStyle || !widthNode || !widthStyle) throw new Error('Expected generated column and width styles');
  const gapMatch = /Property="Margin" Value="(\d+(?:\.\d+)?),0,0,0"/.exec(source.slice(metaStyle.start, metaStyle.end));
  if (!gapMatch) throw new Error('Expected metadata column gap');
  const gap = gapMatch[1];
  let maxBinding;
  if (mainMax) {
    maxBinding = source.slice(mainMax.openEnd, mainMax.closeStart).trim();
  } else {
    const mainStyleText = source.slice(mainStyle.start, mainStyle.end);
    const maxSetterMatch = /<Setter Property="MaxWidth"><Setter\.Value>([\s\S]*?)<\/Setter\.Value><\/Setter>/.exec(mainStyleText);
    if (!maxSetterMatch) throw new Error('Expected main MaxWidth binding');
    maxBinding = maxSetterMatch[1].trim();
  }
  const stacked = `{Binding Tag, ElementName=${bodyName}}`;
  const position = '{Binding Tag, RelativeSource={RelativeSource Self}}';
  const positionFromMain = `{Binding Tag, ElementName=${metaName}}`;
  const when = (binding, value, setters) => `<DataTrigger Binding="${binding}" Value="${value}">${setters}</DataTrigger>`;
  const both = (side, sideBinding, setters) => `<MultiDataTrigger><MultiDataTrigger.Conditions><Condition Binding="${stacked}" Value="True" /><Condition Binding="${sideBinding}" Value="${side}" /></MultiDataTrigger.Conditions>${setters}</MultiDataTrigger>`;
  const top = setter('Grid.Row', '0') + setter('Margin', '0,0,0,24');
  const stretchWidth = setter('Width', 'NaN') + setter('MaxWidth', 'Infinity');
  const metaText = [
    '<Grid.Style><Style TargetType="Grid">',
    setter('Grid.Column', '2'), setter('Grid.Row', '0'), setter('Grid.ColumnSpan', '1'), setter('Margin', `${gap},0,0,0`), setter('HorizontalAlignment', 'Stretch'),
    '<Style.Triggers>',
    when(position, 'Left', setter('Grid.Column', '0') + setter('Margin', `0,0,${gap},0`)),
    when(position, 'Center', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3') + top),
    when(position, 'Stretch', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3') + top),
    when(stacked, 'True', setter('Grid.Column', '0') + setter('Grid.Row', '1') + setter('Grid.ColumnSpan', '3') + setter('Margin', '0,24,0,0')),
    both('Left', position, top),
    both('Center', position, top),
    both('Stretch', position, top),
    '</Style.Triggers></Style></Grid.Style>',
  ].join('');
  const widthStyleText = [
    `<${widthNode.tag}.Style><Style TargetType="${widthNode.tag}">`,
    setter('Width', `{DynamicResource ${widthKey}}`) + setter('MaxWidth', `{DynamicResource ${widthKey}}`),
    '<Style.Triggers>',
    when(stacked, 'True', stretchWidth),
    when(positionFromMain, 'Center', stretchWidth),
    when(positionFromMain, 'Stretch', stretchWidth),
    `</Style.Triggers></Style></${widthNode.tag}.Style>`,
  ].join('');
  const mainText = [
    '<Grid.Style><Style TargetType="Grid">',
    setter('Grid.Column', '1'), setter('Grid.Row', '0'), setter('Grid.ColumnSpan', '1'),
    `<Setter Property="MaxWidth"><Setter.Value>${maxBinding}</Setter.Value></Setter>`,
    '<Style.Triggers>',
    when(stacked, 'True', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3')),
    both('Left', positionFromMain, setter('Grid.Row', '1')),
    when(positionFromMain, 'Center', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3') + setter('Grid.Row', '1') + setter('MaxWidth', 'Infinity')),
    when(positionFromMain, 'Stretch', setter('Grid.Column', '0') + setter('Grid.ColumnSpan', '3') + setter('Grid.Row', '1') + setter('MaxWidth', 'Infinity')),
    '</Style.Triggers></Style></Grid.Style>',
  ].join('');
  const columnsText = '<Grid.ColumnDefinitions><ColumnDefinition Width="Auto" /><ColumnDefinition Width="*" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions>';
  const metaOpening = attr(source.slice(meta.start, meta.openEnd), 'Tag', flag);
  const edits = [];
  if (source.slice(columns.start, columns.end) !== columnsText) edits.push([columns.start, columns.end, columnsText]);
  if (source.slice(meta.start, meta.openEnd) !== metaOpening) edits.push([meta.start, meta.openEnd, metaOpening]);
  if (source.slice(metaStyle.start, metaStyle.end) !== metaText) edits.push([metaStyle.start, metaStyle.end, metaText]);
  if (source.slice(widthStyle.start, widthStyle.end) !== widthStyleText) edits.push([widthStyle.start, widthStyle.end, widthStyleText]);
  if (source.slice(mainStyle.start, mainStyle.end) !== mainText) edits.push([mainStyle.start, mainStyle.end, mainText]);
  if (mainMax) edits.push([mainMax.start, mainMax.end, '']);
  if (!edits.length) return source;
  edits.sort((a, b) => b[0] - a[0]);
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
