// Generates Joyride's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Joyride/art/gen-overviews.mjs
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

// Impact with a black outline: eight offset copies of the text in black, a hard drop shadow, the white text on top.
// The copies bind to the named TextBlock's Text, so Playnite only ever sets one element.
const OFFSETS = [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]];
const outlineCopies = (source, size, wrap, w = 2, shadow = 5) => [[shadow, shadow], ...OFFSETS.map(([x, y]) => [x / 2 * w, y / 2 * w])]
  .map(([x, y]) => `<TextBlock Text="{Binding Text, ElementName=${source}}" FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="${size}"${wrap}
           Foreground="{DynamicResource TextOutlineBrush}" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="${x}" Y="${y}" /></TextBlock.RenderTransform></TextBlock>`)
  .join('\n');

// Score: the HUD money counter. Impact digits in TextBlockGameScore's rating colour (cash green / mission yellow / light red)
// with a black outline, then a five-star wanted meter (a ProgressBar whose indicator clips the gold stars to the score).
const SCORE_PROP = { PART_TextCommunityScore: 'CommunityScore', PART_TextCriticScore: 'CriticScore', PART_TextUserScore: 'UserScore' };
const stars = (brush, outline) => `<StackPanel Orientation="Horizontal" Width="73" HorizontalAlignment="Left">
${[0, 1, 2, 3, 4].map(i => `    <Path Width="13" Height="13" Margin="${i ? '2' : '0'},0,0,0" Stretch="Uniform" Data="{DynamicResource LocalStarGeometry}" Fill="{DynamicResource ${brush}}"${outline ? ' Stroke="{DynamicResource LocalGutterBrush}" StrokeThickness="1.4"' : ''} />`).join('\n')}
</StackPanel>`;
const starMeter = (prop) => `<ProgressBar Minimum="0" Maximum="100" Value="{Binding Game.${prop}, Mode=OneWay, FallbackValue=0, TargetNullValue=0}" Width="73" Height="13"
             Margin="12,0,0,0" VerticalAlignment="Center" Focusable="False" IsHitTestVisible="False">
    <ProgressBar.Template>
        <ControlTemplate TargetType="{x:Type ProgressBar}">
            <Grid>
${indent(stars('LocalDimBrush', false), 16)}
                <Border x:Name="PART_Track" />
                <Border x:Name="PART_Indicator" HorizontalAlignment="Left" ClipToBounds="True">
${indent(stars('LocalGoldBrush', true), 20)}
                </Border>
            </Grid>
        </ControlTemplate>
    </ProgressBar.Template>
</ProgressBar>`;
const scoreRenderer = (part, layout) => `<StackPanel${layout === 'stack' ? ' Grid.Column="2"' : ''} Orientation="Horizontal" HorizontalAlignment="Left" VerticalAlignment="Center">
    <Grid>
${indent(outlineCopies(part, 19, '', 1.5, 2), 8)}
        <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="19" Padding="0" Background="Transparent" />
    </Grid>
${indent(starMeter(SCORE_PROP[part]), 4)}
</StackPanel>`;
// Caption: the V stats label, grey Barlow Condensed Bold capitals.
const captionRenderer = (loc) => `<ContentControl Content="{DynamicResource ${loc}}" Focusable="False" IsTabStop="False" VerticalAlignment="Center"
                Foreground="{DynamicResource TextBrushDarker}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="12">
    <ContentControl.ContentTemplate>
        <DataTemplate>
            <TextBlock Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" TextWrapping="Wrap" />
        </DataTemplate>
    </ContentControl.ContentTemplate>
</ContentControl>`;
const fieldOptions = {
  margin: '0,4',
  captionFontSize: 'FontSizeSmall',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  captionRenderer,
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};
// Group break: a 4px black gutter with the V tri-color tick (DividerTemplate) + 8px gap. The first group's break is hidden by the
// pane's negative top margin: group margin (8) + break (4 + 8) + field margin (4) = 24.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,8" />`;
// The metadata pane is one sticker panel: charcoal, a 2px black rim and a 6px hard black offset, 16px of panel around the content.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top" Margin="0,0,6,6">
    <Control Template="{DynamicResource LocalStickerPanelTemplate}" Background="{DynamicResource LocalPanelBrush}"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-24,0,-4">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions })).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
// Hero: the game's art cut into a box-art collage. One picture seen through three panels: 6px black gutters split it into a wide
// left panel and two stacked right panels, a black scrim rises toward the foot with print halftone in the lower left, and the
// banner ends on a hard 8px black gutter instead of a fade.
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Fill="{DynamicResource LocalGutterBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.38" />
                <GradientStop Color="#BB000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
    <Grid Height="130" VerticalAlignment="Bottom">
        <Grid.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
                <GradientStop Color="#FF000000" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.62" />
            </LinearGradientBrush>
        </Grid.OpacityMask>
        <Rectangle Fill="{DynamicResource LocalGutterBrush}" Opacity="0.4" OpacityMask="{DynamicResource LocalHalftoneMask}" />
    </Grid>
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="62*" />
            <ColumnDefinition Width="6" />
            <ColumnDefinition Width="38*" />
        </Grid.ColumnDefinitions>
        <Grid.RowDefinitions>
            <RowDefinition Height="*" />
            <RowDefinition Height="6" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>
        <Rectangle Grid.Column="1" Grid.RowSpan="3" Fill="{DynamicResource LocalGutterBrush}" />
        <Rectangle Grid.Column="2" Grid.Row="1" Fill="{DynamicResource LocalGutterBrush}" />
    </Grid>
    <Rectangle Height="8" VerticalAlignment="Bottom" Fill="{DynamicResource LocalGutterBrush}" />
</Grid>`;
// Title: the game's name as a box-art title, white Impact in a black outline with a hard shadow, the icon in a black frame with a
// white rim, a black gutter rule with the tri-color tick under the name.
const titleBody = (fontSize) => `<Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,16,0" Background="{DynamicResource LocalGutterBrush}" Padding="3"
        Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Border BorderBrush="{DynamicResource LocalWhiteBrush}" BorderThickness="1">
        <Image x:Name="PART_ImageIcon" MaxWidth="52" MaxHeight="52" />
    </Border>
</Border>
<StackPanel VerticalAlignment="Center">
    <Grid>
${indent(outlineCopies('PART_TextDisplayName', fontSize, ' TextWrapping="Wrap"'), 8)}
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="${fontSize}"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
    </Grid>
    <Grid Width="190" Height="4" Margin="0,8,0,0" HorizontalAlignment="Left">
        <Rectangle Fill="{DynamicResource LocalGutterBrush}" />
        <Control Template="{DynamicResource LocalTriTickTemplate}" Width="30" HorizontalAlignment="Left" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    </Grid>
</StackPanel>`;
const title = `<DockPanel>
${indent(titleBody('{DynamicResource FontSizeLargest}'), 4)}
</DockPanel>`;
const square = (name, tip, icon) => `<Button x:Name="${name}" Style="{DynamicResource LocalGameActionSocket}" Width="40" Height="40" Padding="0" Margin="14,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="164" Height="44">
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
// Section heading: a black tab with a mission-yellow edge and the caption in Barlow Condensed Bold capitals (the V brief tabs).
const heading = (loc) => `<Border Margin="0,0,0,10" HorizontalAlignment="Left" Background="{DynamicResource LocalGutterBrush}" Padding="12,3,10,4">
    <Grid>
        <Rectangle Width="4" Margin="-12,-3,0,-4" HorizontalAlignment="Left" Fill="{DynamicResource LocalMissionBrush}" />
        <ContentControl Content="{DynamicResource ${loc}}" Focusable="False" IsTabStop="False" Foreground="{DynamicResource HeadingForegroundBrush}"
                        FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="13">
            <ContentControl.ContentTemplate>
                <DataTemplate>
                    <TextBlock Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" />
                </DataTemplate>
            </ContentControl.ContentTemplate>
        </ContentControl>
    </Grid>
</Border>`;
const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrushDarker}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrushDarker}" />
    </StackPanel>
</StackPanel>`;
const hideWhenEmpty = hideWhenNoGame('StackPanel');
// Empty page: a loading-screen collage (three scenes panning slowly in a black-gutter grid, the mark in a black title box) with
// the caption in outlined Impact over a gutter rule with the tri-color tick; shown only while no game is selected.
const emptyCaption = `<TextBlock x:Name="EmptyCaption" Text="{DynamicResource LOCErrorNoGameSelected}" TextAlignment="Center" TextWrapping="Wrap"
           FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource HeadingForegroundBrush}" />`;
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style>
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24">
        <Control Template="{DynamicResource LocalEmptyCollageTemplate}" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Grid Margin="0,22,0,0" HorizontalAlignment="Center">
${indent(outlineCopies('EmptyCaption', '{DynamicResource FontSizeLarger}', ' TextAlignment="Center" TextWrapping="Wrap"', 2, 3), 12)}
            ${emptyCaption}
        </Grid>
        <Grid Width="200" Height="4" Margin="0,10,0,0" HorizontalAlignment="Center">
            <Rectangle Fill="{DynamicResource LocalGutterBrush}" />
            <Control Template="{DynamicResource LocalTriTickTemplate}" Width="30" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
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
    Joyride: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner is the game's art cut into a box-art collage by black gutters and ending on a hard black foot; the title is white
    Impact in a black outline straddling that foot; Play is the mission slab, More and Edit are instructional key caps; the
    metadata is one sticker panel with gutter breaks, money-counter scores with wanted-star meters and sticker chips.
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
${indent(bannerSpacer('x * 236 / 300', 28, 'DetailsBannerSpacer'), 32)}
                                <DockPanel>
${indent(actions(' Margin="16,0,6,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(titleBody('{DynamicResource FontSizeLargest}'), 36)}
                                </DockPanel>
                                <Grid Margin="0,30,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '16,16,16,16'), 36)}
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
// Close: the IV/V radar square, 28x28: a black rounded square with an edge-grey rim and a white X at rest, WASTED red fading in on hover.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border Background="{DynamicResource ButtonBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" CornerRadius="{DynamicResource CornerRadiusLarge}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}" BorderBrush="{DynamicResource LocalGutterBrush}" BorderThickness="2" CornerRadius="{DynamicResource CornerRadiusLarge}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="12" Height="12" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
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
const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody('30'), 4)}
</DockPanel>`;
const grid = `<!--
    Joyride: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 214 / 300, a 30px outlined title, actions under it, text left and the sticker panel right.
    Close is the radar square. Structure: Playnite Default 10.60.
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
${indent(bannerSpacer('x * 214 / 300', 22, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,16,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,28,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '16,16,16,16'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: the radar square, 28x28: black with an edge-grey rim and a white X at rest, WASTED red fades in on hover. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
