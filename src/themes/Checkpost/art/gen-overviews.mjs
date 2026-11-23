// Generates Checkpost's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Checkpost/art/gen-overviews.mjs   (then node scripts/game-page-breakpoints.mjs on both files)
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

// A hard 3px diagonal shadow copy of a TextBlock: the title screen's olive extrusion. Binds to the named block's Text.
const shadowText = (source, size, wrap = '', d = 3) => `<TextBlock Text="{Binding Text, ElementName=${source}}" FontFamily="{DynamicResource LocalDisplayFontFamily}" FontSize="${size}"${wrap}
           Foreground="{DynamicResource LocalOliveBrush}" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="${d}" Y="${d}" /></TextBlock.RenderTransform></TextBlock>`;

// Score: a round dark seal (olive-deep disc, dotted inner ring) with the number in Consolas Bold, coloured by TextBlockGameScore's rating
// states (green / amber / red), sitting on the field's underline like every other value on the sheet.
const scoreRenderer = (part, layout) => `<Border${layout === 'stack' ? ' Grid.Column="2"' : ''} VerticalAlignment="Bottom" BorderBrush="{DynamicResource LocalPaperEdgeBrush}" BorderThickness="0,0,0,1">
    <Grid HorizontalAlignment="Center" Margin="0,2,0,3">
        <Ellipse Width="30" Height="30" Fill="{DynamicResource LocalOliveDeepBrush}" />
        <Ellipse Width="24" Height="24" Stroke="{DynamicResource LocalMossBrush}" StrokeThickness="1" StrokeDashArray="1 2" />
        <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" FontFamily="{DynamicResource MonospaceFontFamily}" FontSize="13" FontWeight="Bold"
                   Padding="0" Background="Transparent" HorizontalAlignment="Center" VerticalAlignment="Center" />
    </Grid>
</Border>`;
const fieldOptions = {
  margin: '0,3',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'LocalPaperSoftBrush',
  captionVerticalAlignment: 'Bottom',
  captionMargin: '0',
  captionStackMargin: '0,0,0,3',
  valueOptions: { scoreWrap: false, textForeground: 'LocalPaperInkBrush' },
  scoreRenderer,
};

// Fields on the permit are a caption and a value standing on an underline (Purpose ___VISIT___): text values, button values and plain
// item lists sit in a Border with a 1px taupe bottom edge; chips stay boxes of their own.
const underline = (inner) => `<Border Grid.Column="2" VerticalAlignment="Bottom" BorderBrush="{DynamicResource LocalPaperEdgeBrush}" BorderThickness="0,0,0,1" MinHeight="22">
${indent(inner, 4)}
</Border>`;
const fieldify = (xaml) => xaml
  .replace(/<TextBlock Grid\.Column="2" x:Name="(PART_Text\w+)" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="\{DynamicResource LocalPaperInkBrush\}" \/>/g,
    (_, name) => underline(`<TextBlock x:Name="${name}" Margin="4,1,4,2" HorizontalAlignment="Center" TextAlignment="Center" TextWrapping="Wrap" Foreground="{DynamicResource LocalPaperInkBrush}"${name === 'PART_TextPlayTime' || name === 'PART_TextInstallSize' ? ' FontFamily="{DynamicResource MonospaceFontFamily}" FontSize="13"' : ''} />`))
  .replace(/<Button Grid\.Column="2" x:Name="(PART_Button\w+)" HorizontalAlignment="Left" VerticalAlignment="Center" Style="\{DynamicResource PropertyItemButton\}" \/>/g,
    (_, name) => underline(`<Button x:Name="${name}" Margin="4,0,4,1" HorizontalAlignment="Center" VerticalAlignment="Center" Style="{DynamicResource PropertyItemButton}" />`))
  .replace(/<ItemsControl Grid\.Column="2" x:Name="(PART_Items\w+)" Tag="">([\s\S]*?)<\/ItemsControl>/g,
    (_, name, body) => underline(`<ItemsControl x:Name="${name}" Margin="4,0,4,1" HorizontalAlignment="Center" Tag="">${body}</ItemsControl>`));

// Group break: a dotted rule in the permit's taupe (LocalPaperDividerTemplate, 1px) + 8px gap. The first group's break is hidden by the pane's
// negative top margin: group margin (8) + break (1 + 8) + field margin (3) = 20.
const groupBreak = `<Control Template="{DynamicResource LocalPaperDividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,8" />`;

// The metadata pane is the permit: a pink sheet with a scalloped edge (a ring of round dots: a dashed stroke with round caps), a lime sheet
// peeking under it, a taupe inner border broken at the top by the stamp mark, a red seal on the corner. 30px side padding frames the
// usable width, which stays the theme's GameDetailsPaneWidth / GridDetailsPaneWidth.
const scallop = (fill, margin) => `<Rectangle${margin ? ` Margin="${margin}"` : ''} Fill="{DynamicResource ${fill}}" Stroke="{DynamicResource ${fill}}" StrokeThickness="10" StrokeDashArray="0 1.5" StrokeDashCap="Round" IsHitTestVisible="False" />`;
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top" Margin="0,16,10,10">
    ${scallop('LocalLimeBrush', '5,7,-5,-7')}
    ${scallop('LocalPaperPinkBrush', '')}
    <Border Margin="15" BorderBrush="{DynamicResource LocalPaperEdgeBrush}" BorderThickness="2" IsHitTestVisible="False" />
    <Border HorizontalAlignment="Center" VerticalAlignment="Top" Margin="0,7,0,0" Padding="9,0" Background="{DynamicResource LocalPaperPinkBrush}" IsHitTestVisible="False">
        <Control Template="{DynamicResource BrandMarkTemplate}" Width="16" Height="16" Foreground="{DynamicResource LocalPaperEdgeBrush}" Focusable="False" IsTabStop="False" />
    </Border>
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-20,0,-3">
${indent(META_GROUPS.map(g => fieldify(metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions }))).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
    <Grid Width="40" Height="40" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,-15,12,0" IsHitTestVisible="False" RenderTransformOrigin="0.5,0.5">
        <Grid.RenderTransform>
            <RotateTransform Angle="-12" />
        </Grid.RenderTransform>
        <Ellipse Fill="{DynamicResource LocalSealBrush}" />
        <Ellipse Margin="3" Stroke="{DynamicResource LocalCreamBrush}" StrokeThickness="1" StrokeDashArray="1 2" Opacity="0.7" />
        <Control Template="{DynamicResource BrandMarkTemplate}" Width="22" Height="22" Foreground="{DynamicResource LocalCreamBrush}" Focusable="False" IsTabStop="False" />
    </Grid>
</Grid>`;

// Hero: the game's art sits under a 10px black letterbox bar; six hard bands of void climb over its lower part (no smooth fade).
const band = (a) => a.toString(16).toUpperCase().padStart(2, '0');
const stops = [[0, 0], [0.54, 0], [0.54, 0x29], [0.614, 0x29], [0.614, 0x57], [0.689, 0x57], [0.689, 0x8A], [0.77, 0x8A], [0.77, 0xBD], [0.85, 0xBD], [0.85, 0xE6], [0.925, 0xE6], [0.925, 0xFF], [1, 0xFF]]
  .map(([o, a]) => `<GradientStop Color="#${band(a)}000000" Offset="${o}" />`).join('\n');
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Fill="{DynamicResource LocalVoidBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
${indent(stops, 16)}
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
    <Rectangle Height="10" VerticalAlignment="Top" Fill="{DynamicResource LocalVoidBrush}" />
</Grid>`;

// Title: the game's name in Pixelify Sans with the title screen's olive extrusion, the icon in a cream frame with lime corner ticks.
const titleBody = (fontSize) => `<Grid DockPanel.Dock="Left" VerticalAlignment="Center" Margin="8,0,18,0" Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Border Background="{DynamicResource LocalOliveDeepBrush}" BorderBrush="{DynamicResource LocalCreamBrush}" BorderThickness="2" CornerRadius="1">
        <Image x:Name="PART_ImageIcon" MaxWidth="54" MaxHeight="54" />
    </Border>
    <Border Width="8" Height="8" Margin="-6,-6,0,0" HorizontalAlignment="Left" VerticalAlignment="Top" BorderBrush="{DynamicResource LocalLimeBrush}" BorderThickness="2,2,0,0" IsHitTestVisible="False" />
    <Border Width="8" Height="8" Margin="0,0,-6,-6" HorizontalAlignment="Right" VerticalAlignment="Bottom" BorderBrush="{DynamicResource LocalLimeBrush}" BorderThickness="0,0,2,2" IsHitTestVisible="False" />
</Grid>
<Grid VerticalAlignment="Center" HorizontalAlignment="Left" MinHeight="46" Margin="0,4,0,0">
    <Grid Margin="0,0,3,3" VerticalAlignment="Center">
${indent(shadowText('PART_TextDisplayName', fontSize, ' TextWrapping="Wrap"'), 8)}
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource LocalDisplayFontFamily}" FontSize="${fontSize}"
                   Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />
    </Grid>
</Grid>`;
const square = (name, tip, icon, style) => `<Button x:Name="${name}" Style="{DynamicResource ${style}}" Width="44" Height="44" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="164" Height="50">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions', 'LocalGameActionSocket'), 4)}
${indent(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit', 'LocalGameActionEditSocket'), 4)}
</StackPanel>`;
const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  skeletonContent: '',
});
// Section heading: lime Pixelify Sans over a dotted rule (the rulebook's section titles).
const heading = (loc) => `<StackPanel Margin="0,0,0,10" HorizontalAlignment="Stretch">
    <TextBlock Text="{DynamicResource ${loc}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="20" Foreground="{DynamicResource ValueAccentBrush}" />
    <Control Template="{DynamicResource DividerTemplate}" Margin="0,5,0,0" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
</StackPanel>`;
const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;
const hideWhenEmpty = hideWhenNoGame('StackPanel');
// Empty page: the Official Bulletin (cream sheet, hatched text blocks, a red seal, a blinking caret) with the caption in Pixelify Sans under it.
const emptyCaption = `<TextBlock x:Name="EmptyCaption" Text="{DynamicResource LOCErrorNoGameSelected}" TextAlignment="Center" TextWrapping="Wrap"
           FontFamily="{DynamicResource LocalDisplayFontFamily}" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource TextBrush}" />`;
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style>
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24">
        <Control Template="{DynamicResource LocalBulletinTemplate}" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Grid Margin="0,16,0,0" HorizontalAlignment="Center">
${indent(shadowText('EmptyCaption', '{DynamicResource FontSizeLarger}', ' TextAlignment="Center" TextWrapping="Wrap"', 2), 12)}
            ${emptyCaption}
        </Grid>
        <Control Template="{DynamicResource DividerTemplate}" Width="180" Margin="0,12,0,0" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
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
    Checkpost: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner sits under a black letterbox bar and dissolves into the void in six hard bands; the title is Pixelify Sans with the title
    screen's olive extrusion beside an icon in a cream frame; Play is the rubber stamp, More and Edit are olive squares on a hard ledge;
    the metadata is the permit: a pink scalloped sheet over a lime one, a taupe inner border, fields standing on underlines, seal scores.
    Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 146 / 224', 28, 'DetailsBannerSpacer'), 32)}
                                <DockPanel>
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(titleBody('40'), 36)}
                                </DockPanel>
                                <Grid Margin="0,22,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '30,34,30,28'), 36)}
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
// Close: a 28x28 olive plate with a hard ledge and a cream X at rest; the danger red steps in on hover (the red X of the game's discrepancy bar).
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border Margin="0,3,0,0" Background="{DynamicResource LocalEdgeBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Border Margin="0,0,0,3" Background="{DynamicResource ButtonBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Margin="0,0,0,3" Background="{DynamicResource DangerBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" Margin="0,0,0,3" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource TextBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Setter TargetName="HoverPlate" Property="Opacity" Value="1" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="CloseHoverIn"><Storyboard>
                    <DoubleAnimationUsingKeyFrames Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity">
                        <DiscreteDoubleKeyFrame KeyTime="0:0:0" Value="0.5" />
                        <DiscreteDoubleKeyFrame KeyTime="0:0:0.05" Value="1" />
                    </DoubleAnimationUsingKeyFrames>
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <RemoveStoryboard BeginStoryboardName="CloseHoverIn" />
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.85" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody('32'), 4)}
</DockPanel>`;
const grid = `<!--
    Checkpost: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 128 / 224, a 32px Pixelify title, actions under it, text left and the permit sheet right.
    Close is the olive plate with a cream X (red on hover). Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource PanelSeparatorBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="6,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,6,0" />
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
${indent(bannerSpacer('x * 128 / 224', 22, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,16,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,24,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '30,34,30,28'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: a 28x28 olive plate over a hard ledge with a cream X at rest; the danger red steps in on hover. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
