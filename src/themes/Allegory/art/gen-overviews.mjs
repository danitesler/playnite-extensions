// Generates Allegory's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Allegory/art/gen-overviews.mjs   (then node scripts/game-page-breakpoints.mjs on both files)
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

// Score: the MONEY plate inverted, an ink plate with a slanted left end, the number in Playfair Display SC Black in the rating colour
// (TextBlockGameScore's positive / mixed / negative brushes read on ink).
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center" Margin="0,1,0,1">
    <Control Template="{DynamicResource LocalSlantPlateTemplate}" Background="{DynamicResource LocalInkBrush}" Focusable="False" IsTabStop="False" />
    <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" FontFamily="{DynamicResource LocalDisplayFontFamily}" FontSize="17"
               Margin="14,1,10,3" Padding="0" Background="Transparent" />
</Grid>`;
// Captions are the game's small caps labels (MONEY, MAG): Playfair Display SC Bold, muted, beside the value.
const fieldOptions = {
  margin: '0,5',
  captionFontFamily: 'LocalCapsFontFamily',
  captionFontWeight: 'Bold',
  captionFontSize: '12',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};

// Group break: the Load list's doubled hairline (DividerTemplate, 4px) + 8px gap. The first group's break is hidden by the pane's negative top
// margin: group margin (8) + break (4 + 8) + field margin (5) = 25.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,8" />`;
// The metadata pane is a borderless ledger on the ground: no card, no frame, only the hairline breaks.
const pane = (widthKey) => `<Grid Grid.Column="2" VerticalAlignment="Top">
    <StackPanel Width="{DynamicResource ${widthKey}}">
        <Grid ClipToBounds="True">
            <StackPanel Margin="0,-25,0,-5">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions })).join('\n'), 16)}
            </StackPanel>
        </Grid>
    </StackPanel>
</Grid>`;

// Hero: the game's art; the ground rises over its lower part with a plain gradient (no OpacityMask on art behind the animated Play
// button), and the foot is the dragged dry-brush edge as a vector Path (LocalBannerEdgeGeometry) in the page colour.
const pageColour = '{Binding Background, ElementName=PageRoot}';
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Opacity="0.7">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.42" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Path Height="58" VerticalAlignment="Bottom" Stretch="Fill" Data="{DynamicResource LocalBannerEdgeGeometry}" Fill="${pageColour}" />
</Grid>`;

// The giant cropped section title (SYSTEM, QUEST, ITEM): the game's name in Playfair Display SC Black at 150px, paper at 16%, right-aligned to
// the page's right edge and bleeding off it, rising into the banner foot. A zero-height Canvas hosts it, so it never widens the page.
const watermark = (size, top) => `<Canvas Height="0" IsHitTestVisible="False" ClipToBounds="False">
    <TextBlock Canvas.Right="-60" Canvas.Top="${top}" Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource LocalDisplayFontFamily}"
               FontSize="${size}" Foreground="{DynamicResource LocalWatermarkBrush}" TextWrapping="NoWrap" />
</Canvas>`;

// Title: the game's name in Playfair Display SC Black (title case gives the enlarged initials), the icon in a hairline frame.
const titleBody = (fontSize) => `<Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,16,0" Padding="3" BorderBrush="{DynamicResource LocalRuleStrongBrush}" BorderThickness="1"
        Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Image x:Name="PART_ImageIcon" MaxWidth="52" MaxHeight="52" />
</Border>
<Grid VerticalAlignment="Center" HorizontalAlignment="Left" MinHeight="46">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource LocalDisplayFontFamily}" FontSize="${fontSize}" VerticalAlignment="Center"
               Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" LineHeight="${Math.round(fontSize * 1.08)}" LineStackingStrategy="BlockLineHeight" />
</Grid>`;
const ring = (name, tip, icon) => `<Button x:Name="${name}" Style="{DynamicResource LocalGameActionRing}" Width="40" Height="40" Padding="0" Margin="12,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="176" Height="42" Margin="0,0,22,0">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(ring('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${indent(ring('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;
const steam = steamScreenshotsGate({
  margin: '0,0,0,20',
  skeletonContent: '',
});
// Section heading: Playfair Display SC Black (DESCRIPTION, NOTES) with a hairline running out to the right.
const heading = (loc) => `<DockPanel Margin="0,0,0,10" LastChildFill="True">
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" VerticalAlignment="Center" />
    <Border Height="1" Margin="12,2,0,0" VerticalAlignment="Center" Background="{DynamicResource HeadingRuleBrush}" IsHitTestVisible="False" />
</DockPanel>`;
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
// Empty page: the Archetype ring (two slowly counter-turning compass rings around the mark) over the caption in Playfair Display SC Black and
// the doubled hairline.
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style>
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24">
        <Control Template="{DynamicResource LocalEmptyPageTemplate}" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <TextBlock x:Name="EmptyCaption" Margin="0,18,0,0" Text="{DynamicResource LOCErrorNoGameSelected}" TextAlignment="Center" TextWrapping="Wrap"
                   FontFamily="{DynamicResource LocalDisplayFontFamily}" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource HeadingForegroundBrush}" />
        <Control Template="{DynamicResource DividerTemplate}" Width="200" Margin="0,12,0,0" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    </StackPanel>
</Grid>`;
const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;
const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="30" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;
const details = `<!--
    Allegory: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner's art ends in a dragged dry-brush edge (a vector Path in the page colour) under a plain gradient; the game's name rises behind
    the header as the menus' giant cropped title (Playfair Display SC Black 150px, paper at 16%, bleeding off the right edge). The title is
    Playfair Display SC Black 34px beside the icon in a hairline frame; Play (the paper prompt plate with the crimson brush splash on hover)
    and the More / Edit ring prompts sit under it. Screenshots and description on the left; the metadata is a borderless ledger on the
    ground with small caps captions, doubled hairline breaks, ink score plates and paper tag chips.
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
                            <StackPanel Margin="30,0,30,30">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 188 / 290', 30, 'DetailsBannerSpacer'), 32)}
${indent(watermark(150, -96), 32)}
                                <DockPanel>
${indent(titleBody(34), 36)}
                                </DockPanel>
${indent(actions(' Margin="0,16,0,0"'), 32)}
                                <Grid Margin="0,26,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth'), 36)}
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
// Close: the button prompt, 28x28: a disc in the button fill with a hairline rim and a paper X at rest; the danger disc fades in on hover and the
// X turns to the danger foreground.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Ellipse Fill="{DynamicResource ButtonBackgroundBrush}" Stroke="{DynamicResource NormalBorderBrush}" StrokeThickness="1" IsHitTestVisible="False" />
        <Ellipse x:Name="HoverPlate" Fill="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource TextBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="CloseHoverIn"><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard x:Name="CloseHoverOut"><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.8" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody(28), 4)}
</DockPanel>`;
const grid = `<!--
    Allegory: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 172 / 290, the giant cropped title at 120px, a 28px Didone title, actions under it, text left and the
    ledger right. Close is the 28px button prompt (the danger disc fades in on hover). Structure: Playnite Default 10.60.
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
${indent(pageRootStyle(), 36)}
${indent(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 172 / 290', 24, 'GridBannerSpacer'), 40)}
${indent(watermark(120, -76), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,16,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,26,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: the 28x28 button prompt: a button-fill disc with a hairline rim and a paper X at rest; the danger disc fades in on hover. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
