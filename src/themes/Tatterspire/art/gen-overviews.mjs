// Generates Tatterspire's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Tatterspire/art/gen-overviews.mjs
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
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
// Score: the energy orb, a hexagonal gem with the number (community green, critic gold, user red).
const orbFace = { PART_TextCommunityScore: ['LocalEnergyBrush', 'LocalInkBrush'], PART_TextCriticScore: ['LocalGoldDeepBrush', 'LocalInkBrush'], PART_TextUserScore: ['LocalFlagLitBrush', 'TextBrush'] };
const scoreRenderer = (part, layout) => {
  const [face, ink] = orbFace[part] || ['LocalFlagLitBrush', 'TextBrush'];
  return `<ContentControl${layout === 'stack' ? ' Grid.Column="2"' : ''} Template="{DynamicResource LocalEnergyOrbTemplate}" Width="56" Height="28" HorizontalAlignment="Left" VerticalAlignment="Center"
                Foreground="{DynamicResource ${face}}" Background="{DynamicResource LocalInkBrush}" Focusable="False" IsTabStop="False">
    <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" Foreground="{DynamicResource ${ink}}" FontWeight="Bold" FontSize="14" Padding="0" Background="Transparent"
               HorizontalAlignment="Center" VerticalAlignment="Center" TextAlignment="Center" />
</ContentControl>`;
};
const fieldOptions = {
  margin: '0,4',
  captionFontSize: 'FontSize',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};
// Group break: a gold swash opening a hairline that fades out (DividerTemplate), 10px + 6px gap. The first group's break is
// hidden by the pane's negative top margin: M(8) + break(16) + field margin(4) = 28.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,6"
         Foreground="{DynamicResource HeadingRuleBrush}" />`;
// The metadata pane is one torn sheet of slate paper (the dialog's own look): ink outline, paper, stains and the rim, then the groups
// on it. Its torn edge sits 1-8px inside the host, so the padding keeps 22px of paper around the 300px of content.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <Control Template="{DynamicResource LocalTornSheetTemplate}" Background="{DynamicResource LocalInkBrush}" Foreground="{DynamicResource ExpanderBackgroundBrush}"
             BorderBrush="{DynamicResource LocalSlateRimBrush}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-28,0,-4">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
// Hero: the banner art under a light slate wash, the page's own paper tearing across its foot (LocalTornFootTemplate in the page color).
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.4" />
                <GradientStop Color="#470D151B" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Control Template="{DynamicResource LocalTornFootTemplate}" Height="30" VerticalAlignment="Bottom" Foreground="{DynamicResource GameOverviewBackgroundBrush}" Focusable="False" IsTabStop="False" />
</Grid>`;
// Title: gold bold slab serif over a soft ink outline (a second copy offset 2px), on the act title's dark translucent band.
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="36" MaxHeight="36" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Grid VerticalAlignment="Center">
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold"
                   Foreground="{DynamicResource LocalInkBrush}" Margin="0,2,0,0" TextWrapping="Wrap" IsHitTestVisible="False" />
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
    </Grid>
</DockPanel>`;
const square = (name, tip, icon) => `<Button x:Name="${name}" Style="{DynamicResource LocalGameActionSocket}" Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="168" Height="42">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${indent(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;
const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  skeletonContent: '',
});
const heading = (loc) => `<StackPanel Margin="0,0,0,10">
    <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" FontSize="{DynamicResource FontSizeLarger}" />
    <Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Width="170" HorizontalAlignment="Left" Margin="0,3,0,0"
             Foreground="{DynamicResource HeadingRuleBrush}" />
</StackPanel>`;
const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSizeLarge}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LocalCyanBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;
const hideWhenEmpty = hideWhenNoGame('StackPanel');
// Empty page: the map sheet (parchment, dotted route, a gold-bracketed node), shown only while no game is selected.
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style><StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24"><Control Template="{DynamicResource LocalEmptyMapTemplate}" Width="360" Height="230" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" /><TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" Margin="0,16,0,0" TextAlignment="Center" TextWrapping="Wrap" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource HeadingForegroundBrush}"/></StackPanel></Grid>`;
const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;
const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="24" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;
// The act title band: a dark translucent strip across the page behind the header, bled past the 28px / 22px page margins.
const band = (inner, bleed, pad) => `<Border Background="{DynamicResource LocalScrimBrush}" Margin="-${bleed},0,-${bleed},0" Padding="${pad}">
${indent(inner, 4)}
</Border>`;
const details = `<!--
    Tatterspire: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner tears away into the page (LocalTornFootTemplate), the title sits on the act title's dark band in gold slab serif, Play is the
    Proceed hexagon, the metadata is one torn slate sheet with swash breaks, score orbs and ribbon-tag chips. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" Style="{DynamicResource DetailsScrollViewer}" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(hero, 28)}
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 205 / 320', 20, 'DetailsBannerSpacer'), 32)}
${indent(band(`<DockPanel>
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 4)}
${indent(title, 4)}
</DockPanel>`, 28, '28,12,28,12'), 32)}
                                <Grid Margin="0,34,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '22,22,22,22'), 36)}
                                </Grid>
                            </StackPanel>
${indent(empty, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
const gridTitle = title.replace('<DockPanel>', '<DockPanel Panel.ZIndex="2">').replace('    <Image', `${indent(inlineCloseButton(), 4)}\n    <Image`);
// Close: the Back flag, 28x28: a slate flag with a cream X at rest (ink outline), the red danger flag fading in on hover.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Control Template="{DynamicResource LocalFlagTemplate}" Foreground="{DynamicResource LocalInkBrush}" Background="{DynamicResource LocalInkBrush}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Control Template="{DynamicResource LocalFlagTemplate}" Margin="2" Foreground="{DynamicResource ButtonBackgroundBrush}" Background="{DynamicResource LocalInkBrush}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Control x:Name="HoverPlate" Template="{DynamicResource LocalFlagTemplate}" Margin="2" Foreground="{DynamicResource DangerBrush}" Background="{DynamicResource LocalInkBrush}" Opacity="0" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="12" Height="12" Margin="0,0,5,0" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
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
</ControlTemplate>`;
const grid = `<!--
    Tatterspire: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 185 / 320, actions under the title, text left and the torn metadata sheet right. Close is the Back
    flag. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource PanelSeparatorBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="2,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,2,0" />
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
${indent(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 185 / 320', 14, 'GridBannerSpacer'), 40)}
${indent(band(`<StackPanel Panel.ZIndex="2">
${indent(gridTitle, 4)}
${indent(actions(' Margin="0,12,0,0"'), 4)}
</StackPanel>`, 22, '22,10,22,12'), 40)}
                                        <Grid Margin="0,30,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '20,20,20,20'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: the Back flag, 28x28: slate at rest with an ink outline and a cream X, the danger red flag fades in on hover. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
