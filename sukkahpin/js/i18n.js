// SukkahPin UI copy. English is the default. Yiddish is heimish Yiddish (the way it's written in
// Williamsburg / Monsey / Lakewood): short, conversational, English loanwords
// where that's what people actually say. Sukkah content (titles, descriptions)
// stays as the owner wrote it; only the interface switches.

const en = {
  'nav.explore': 'Explore', 'nav.submit': 'Submit', 'nav.sources': 'Sukkah Sources', 'nav.winners': 'Winners', 'nav.about': 'About',
  'nav.cta': 'Submit Your Sukkah', 'nav.search': 'Search sukkahs, towns, styles…', 'nav.lang': 'אידיש',

  'hero.eyebrow': ['Real homes', 'Real ideas', 'Real sukkahs'],
  'hero.h1': 'Every', 'hero.h2': 'sukkah', 'hero.h3a': 'has a', 'hero.h3b': 'story.',
  'hero.sub': 'A community gallery of creative sukkahs from around the world. Get inspired, vote for your favorites, and see where everything came from.',
  'hero.cta': 'Explore Sukkahs', 'hero.video': 'Watch Video',
  'hero.join': 'Join thousands sharing their sukkahs.', 'hero.scroll': ['Scroll', 'to explore'], 'hero.stat': 'Sukkahs',
  'hero.viewing': 'Now showing',

  'tabs.trending': 'Trending', 'tabs.year': 'This year', 'tabs.new': 'New', 'tabs.voted': 'Most Voted', 'tabs.all': 'View all',
  'style.eyebrow': 'Explore by style', 'style.h1': 'Find your', 'style.h2': 'inspiration.',
  'style.sub': 'From modern designs to cozy family setups, explore sukkahs by style, size, or theme.',
  'gallery.eyebrow': 'The gallery', 'gallery.h': 'Look closer.', 'gallery.empty': 'Nothing here yet. Be the first.',
  'sources.teaser.eyebrow': 'Sukkah Sources', 'sources.teaser.h': 'Seen it?<br>Shop it.',
  'sources.teaser.sub': 'Every lamp, chair and tablecloth our community tagged, in one place.', 'sources.teaser.cta': 'Browse Sukkah Sources',
  'band.h1': 'Your sukkah', 'band.h2': 'has a story too.', 'band.sub': 'Five quick steps. Photos from your phone are perfect.',
  'band.cta': 'Submit Your Sukkah',

  'cat.Modern': 'Modern', 'cat.DIY': 'DIY', 'cat.Family': 'Family', 'cat.Small Space': 'Small Space', 'cat.Luxury': 'Luxury',
  'cat.Creative': 'Creative', 'cat.Outdoor': 'Outdoor', 'cat.Balcony': 'Balcony', 'cat.Lighting': 'Lighting', 'cat.Themed': 'Themed',
  'cat.Custom': 'Custom', 'cat.Balcony / Patio': 'Balcony / Patio',

  'vote.vote': 'Vote', 'vote.voted': 'Voted', 'vote.title': 'Vote for', 'vote.why': 'One vote per person per sukkah. We’ll email you a quick code — no account, no password.',
  'vote.email': 'Your email', 'vote.send': 'Send my code', 'vote.code': 'Code from the email', 'vote.check': 'Vote',
  'vote.sent': 'Check your email.', 'vote.sentSub': 'Type the code we sent — or just tap the link in the email. Sent to', 'vote.bad': 'That code didn’t match. Try again?',
  'vote.error': 'Something went wrong. Please try again.', 'vote.limit': 'Lots of votes from this network today — try again tomorrow.', 'vote.slow': 'Too many tries — wait a minute and try again.', 'vote.badEmail': 'That email doesn’t look right.',
  'vote.done': 'Your vote is in.', 'vote.doneSub': 'Want to help it win? Send it to your family chat.',
  'vote.dup': 'You already voted for this one.', 'vote.dupSub': 'Thanks! Sharing it helps just as much.',
  'share.wa': 'Share on WhatsApp', 'share.copy': 'Copy link', 'share.copied': 'Link copied',
  'share.text': 'Check out this sukkah on SukkahPin — vote for it here.',

  'detail.by': 'By', 'detail.votes': 'votes', 'detail.special': 'What makes it special', 'detail.shop': 'Shop this sukkah',
  'detail.shopOn': 'Hide products', 'detail.shopHint': 'Tap ✦ to see what’s in the photo', 'detail.shopSection': 'Shop this sukkah',
  'detail.shopEmpty': 'No products tagged yet.', 'detail.more': 'More sukkahs', 'detail.view': 'View Item', 'detail.pick': 'Editor’s Pick',
  'detail.photoCount': 'photos', 'detail.notFound': 'We couldn’t find that sukkah.', 'detail.back': 'Back to the gallery',
  'detail.preview': 'Preview — this is how your page will look.',

  'sub.step': 'Step', 'sub.of': 'of', 'sub.next': 'Next', 'sub.back': 'Back', 'sub.skip': 'Skip this step',
  'sub.s1': 'Show us your sukkah', 'sub.s1sub': 'Upload up to 8 photos. Drag to reorder. Tap the star to choose your cover.',
  'sub.camera': 'Take a photo', 'sub.library': 'Choose from library', 'sub.drop': 'or drop photos here', 'sub.cover': 'Cover',
  'sub.label': 'What’s in this photo?', 'sub.max': 'That’s 8 — the maximum for now.', 'sub.needPhoto': 'Add at least one photo to continue.',
  'sub.s2': 'Tell us about it', 'sub.s2sub': 'A few words is plenty.',
  'sub.name': 'Sukkah name', 'sub.namePh': 'The Garden Sukkah', 'sub.loc': 'Location', 'sub.locPh': 'Monsey, NY',
  'sub.desc': 'Short description', 'sub.descPh': 'How it came together, who it’s for…',
  'sub.special': 'What makes your sukkah special?', 'sub.specialPh': 'The one thing people always notice',
  'sub.cats': 'Pick a few styles', 'sub.need2': 'Add a name and location to continue.',
  'sub.s3': 'Tag what you used', 'sub.s3sub': 'Help someone recreate the look. Optional.',
  'sub.s3tip': 'Pick a photo, then tap right on the thing you want to tag.', 'sub.tagged': 'tagged', 'sub.maxTags': 'That’s 8 items — the maximum for now.',
  'sub.what': 'What is it?', 'sub.whatPh': 'Linen tablecloth', 'sub.where': 'Where did you buy it?', 'sub.wherePh': 'Target',
  'sub.link': 'Link', 'sub.price': 'Price (optional)', 'sub.note': 'Note (optional)', 'sub.notePh': 'Used two layered together',
  'sub.category': 'Category', 'sub.save': 'Save tag', 'sub.cancel': 'Cancel', 'sub.delete': 'Remove',
  'sub.s4': 'About you', 'sub.s4sub': 'We’ll only use this to tell you when your sukkah is live.',
  'sub.yourName': 'Name', 'sub.email': 'Email', 'sub.phone': 'Phone (optional)',
  'sub.showName': 'Show my name publicly', 'sub.useDisplay': 'Use a display name instead', 'sub.displayPh': 'A family in Lakewood',
  'sub.need4': 'Add your name and a valid email to continue.',
  'sub.s5': 'Preview', 'sub.s5sub': 'This is your page. Look good?', 'sub.submit': 'Submit My Sukkah',
  'sub.done': 'Your sukkah is in.', 'sub.doneSub': 'We’ll let you know once it’s live.', 'sub.doneShare': 'Tell the family',
  'sub.another': 'Back to the gallery', 'sub.failed': 'Couldn’t send it — check your connection and try again.',

  'src.eyebrow': 'Sukkah Sources', 'src.h1': 'Seen it.', 'src.h2': 'Shop it.',
  'src.sub': 'Everything our community tagged in their sukkahs — lights, tables, walls, and the DIY tricks behind them.',
  'src.all': 'All', 'src.seenIn': 'Seen in', 'src.seenInThese': 'Seen in these sukkahs', 'src.sukkah': 'sukkah', 'src.sukkahs': 'sukkahs',

  'win.eyebrow': 'Winners', 'win.h1': 'The ones', 'win.h2': 'everyone loved.', 'win.picks': 'Editor’s Picks', 'win.board': 'Current standings',
  'about.eyebrow': 'About',

  'sub.video': 'Add a video', 'sub.optional': 'Optional', 'sub.videoSub': 'A short walk-through looks great. Upload a clip (up to 50 MB) or paste a YouTube / Vimeo link.',
  'sub.videoUpload': 'Upload a video', 'sub.or': 'or', 'sub.videoLinkPh': 'Paste a YouTube or Vimeo link',
  'sub.videoBig': 'That video is over 50 MB — trim it, or upload it to YouTube and paste the link.', 'sub.videoBad': 'That link isn’t a YouTube, Vimeo or video file link.',
  'sub.year': 'Which year is this sukkah from?', 'sub.thisYear': 'This year', 'sub.orEarlier': 'or earlier',
  'sub.visitQ': 'Can people come see it in person?', 'sub.visitYes': 'Yes, come visit', 'sub.visitNo': 'No, photos only',
  'sub.visitPublic': 'This is shown publicly on your sukkah page.', 'sub.address': 'Exact address', 'sub.addressPh': '12 Main St, Monsey, NY',
  'sub.times': 'When can people come?', 'sub.timesPh': 'Chol Hamoed, 2–6 pm', 'sub.visitContact': 'Contact (optional)', 'sub.visitContactPh': 'Phone / WhatsApp',
  'sub.needAddr': 'Add the address so visitors can find it — or choose “No, photos only”.',
  'detail.year': 'Sukkos', 'detail.thisYear': 'This year', 'detail.video': 'Video',
  'visit.open': 'Open to visitors', 'visit.when': 'When', 'visit.directions': 'Directions', 'visit.whatsapp': 'WhatsApp the owner',
  'visit.waText': 'Hi! I saw {title} on SukkahPin — can we come see it?', 'visit.badge': 'Open to visit', 'visit.filter': 'Open to visit',
  'sub.editing': 'Editing', 'sub.saveChanges': 'Save changes', 'sub.saved': 'Saved.', 'sub.savedSub': 'Your sukkah page is updated.',
  'sub.savedPending': 'Saved — we’ll let you know once it’s live.', 'sub.viewPage': 'View my sukkah',
  'sub.keepLink': 'Your private edit link', 'sub.keepLinkSub': 'Use it to fix or update your sukkah anytime. Anyone with this link can edit it — send it to yourself, not to the group.',
  'sub.sendMe': 'Send to myself on WhatsApp', 'sub.editLinkText': 'My SukkahPin edit link for {title}:',
  'edit.bad': 'This edit link doesn’t work.', 'edit.badSub': 'It may be old or missing a piece. Ask us for a new one.', 'detail.edit': 'Edit my sukkah',
  'picks.tag': 'Top picks', 'picks.h': 'See this year’s most creative sukkahs first.',
  'picks.sub': 'We’ll send you a few hand-picked sukkahs over Yom Tov — by WhatsApp or email.',
  'picks.ph': 'Phone number or email', 'picks.cta': 'Send me the picks', 'picks.fine': 'Only the picks. No spam, and you can ask us to stop anytime.',
  'picks.bad': 'Enter a phone number or an email address.', 'picks.done': 'You’re on the list.', 'picks.doneSub': 'We’ll send you this year’s top picks.',
  'picks.already': 'You’re on the list for this year’s top picks.', 'picks.later': 'Not now', 'picks.voteLine': 'Want this year’s top picks too?',
  'footer.line': 'Every sukkah has a story.', 'footer.admin': 'Admin', 'footer.sample': 'Sample sukkahs shown for demonstration.',
  'search.results': 'Results for', 'search.none': 'No sukkahs match that yet.',
  'video.title': 'A walk through this year’s sukkahs', 'close': 'Close',
};

const yi = {
  'nav.explore': 'קוקט אריין', 'nav.submit': 'שיקט אריין', 'nav.sources': 'וואו צו קויפן', 'nav.winners': 'געווינער', 'nav.about': 'וועגן אונז',
  'nav.cta': 'שיקט אריין אייער סוכה', 'nav.search': 'זוכט א סוכה, א שטאט, א סטייל…', 'nav.lang': 'English',

  'hero.eyebrow': ['אמת׳ע הייזער', 'אמת׳ע אידעעס', 'אמת׳ע סוכות'],
  'hero.h1': 'יעדע', 'hero.h2': 'סוכה', 'hero.h3a': 'האט א', 'hero.h3b': 'מעשה.',
  'hero.sub': 'שיינע סוכות פון איבער די וועלט, אויף איין פלאץ. כאפט אידעעס, שטימט פאר די וואס געפעלן אייך, און זעט וואו מ׳האט אלעס געקויפט.',
  'hero.cta': 'זעט די סוכות', 'hero.video': 'קוקט דעם ווידעא',
  'hero.join': 'טויזנטער אידן טיילן שוין זייערע סוכות.', 'hero.scroll': ['סקראלט', 'אראפ'], 'hero.stat': 'סוכות',
  'hero.viewing': 'יעצט ווייזט מען',

  'tabs.trending': 'פאפולער', 'tabs.year': 'היי יאר', 'tabs.new': 'נייע', 'tabs.voted': 'מערסטע שטימען', 'tabs.all': 'זעט אלעס',
  'style.eyebrow': 'לויט סטייל', 'style.h1': 'געפינט', 'style.h2': 'אייער סטייל.',
  'style.sub': 'פון מאדערנע סוכות ביז היימישע משפחה סוכות — זוכט לויט סטייל, גרייס, אדער טעמע.',
  'gallery.eyebrow': 'די גאלערי', 'gallery.h': 'קוקט נענטער.', 'gallery.empty': 'נאך גארנישט דא. זייט דער ערשטער!',
  'sources.teaser.eyebrow': 'וואו צו קויפן', 'sources.teaser.h': 'געזען?<br>קויפט עס.',
  'sources.teaser.sub': 'יעדע לעמפ, שטול און טישטעך וואס אונזער עולם האט געטאגט — אויף איין פלאץ.', 'sources.teaser.cta': 'זעט וואו צו קויפן',
  'band.h1': 'אייער סוכה', 'band.h2': 'האט אויך א מעשה.', 'band.sub': 'פינף גרינגע טריט. בילדער פון טעלעפאן זענען פונקט גוט.',
  'band.cta': 'שיקט אריין אייער סוכה',

  'cat.Modern': 'מאדערן', 'cat.DIY': 'אליינס געמאכט', 'cat.Family': 'משפחה', 'cat.Small Space': 'קליין פלאץ', 'cat.Luxury': 'לוקסוס',
  'cat.Creative': 'קריעטיוו', 'cat.Outdoor': 'אינדרויסן', 'cat.Balcony': 'באלקאן', 'cat.Lighting': 'ליכט', 'cat.Themed': 'מיט א טעמע',
  'cat.Custom': 'ספעציעל געבויט', 'cat.Balcony / Patio': 'באלקאן / פעטיא',

  'vote.vote': 'שטימט', 'vote.voted': 'געשטימט', 'vote.title': 'שטימט פאר', 'vote.why': 'איין שטימע פער מענטש פאר יעדע סוכה. מיר דארפן נאר איינמאל טשעקן אייער אימעיל — קיין אקאונט, קיין פאסווארד.',
  'vote.email': 'אייער אימעיל', 'vote.send': 'שיקט מיר א קאוד', 'vote.code': 'דער קאוד פון אימעיל', 'vote.check': 'שטימט',
  'vote.sent': 'קוקט אין אייער אימעיל.', 'vote.sentSub': 'לייגט אריין דעם קאוד — אדער דריקט אויפ׳ן לינק אין אימעיל. געשיקט צו', 'vote.bad': 'דער קאוד שטימט נישט. פרובירט נאכאמאל?',
  'vote.error': 'עפעס איז נישט געגאנגען. פרובירט נאכאמאל.', 'vote.limit': 'צופיל שטימען פון דעם נעץ היינט — פרובירט מארגן.', 'vote.slow': 'צופיל מאל — ווארט א מינוט און פרובירט נאכאמאל.', 'vote.badEmail': 'דער אימעיל זעט נישט אויס גוט.',
  'vote.done': 'אייער שטימע איז אריין!', 'vote.doneSub': 'ווילט איר העלפן? שיקט עס אין די משפחה גרופע.',
  'vote.dup': 'איר האט שוין געשטימט פאר די סוכה.', 'vote.dupSub': 'יישר כח! שיקן עס ווייטער העלפט פונקט אזוי.',
  'share.wa': 'שיקט אויף וואטסעפ', 'share.copy': 'קאפירט דעם לינק', 'share.copied': 'דער לינק איז קאפירט',
  'share.text': 'קוקט אויף די סוכה אויף SukkahPin — גיבט א שטימע דא.',

  'detail.by': 'פון', 'detail.votes': 'שטימען', 'detail.special': 'וואס איז ספעציעל', 'detail.shop': 'שאפט די סוכה',
  'detail.shopOn': 'באהאלט', 'detail.shopHint': 'דריקט אויף ✦ צו זען וואס איז אין בילד', 'detail.shopSection': 'שאפט די סוכה',
  'detail.shopEmpty': 'נאך נישט געטאגט.', 'detail.more': 'נאך סוכות', 'detail.view': 'קוקט אן', 'detail.pick': 'אונזער אויסוואל',
  'detail.photoCount': 'בילדער', 'detail.notFound': 'מיר האבן נישט געטראפן די סוכה.', 'detail.back': 'צוריק צו די גאלערי',
  'detail.preview': 'אזוי וועט אייער בלאט אויסזען.',

  'sub.step': 'טריט', 'sub.of': 'פון', 'sub.next': 'ווייטער', 'sub.back': 'צוריק', 'sub.skip': 'איבערהיפן',
  'sub.s1': 'ווייזט אונז אייער סוכה', 'sub.s1sub': 'לייגט ארויף ביז 8 בילדער. שלעפט זיי צו טוישן דעם סדר. דריקט דעם שטערן פאר׳ן הויפט בילד.',
  'sub.camera': 'נעמט א בילד', 'sub.library': 'קלייבט פון די בילדער', 'sub.drop': 'אדער שלעפט די בילדער אהער', 'sub.cover': 'הויפט',
  'sub.label': 'וואס איז אין די בילד?', 'sub.max': 'דאס איז 8 — מער גייט נישט יעצט.', 'sub.needPhoto': 'לייגט ארויף כאטש איין בילד.',
  'sub.s2': 'דערציילט אונז דערוועגן', 'sub.s2sub': 'א פאר ווערטער איז גענוג.',
  'sub.name': 'וואס רופט מען די סוכה?', 'sub.namePh': 'די גארטן סוכה', 'sub.loc': 'וואו?', 'sub.locPh': 'מאנסי, NY',
  'sub.desc': 'א קורצע באשרייבונג', 'sub.descPh': 'ווי אזוי עס איז צוזאמגעקומען…',
  'sub.special': 'וואס איז ספעציעל ביי אייער סוכה?', 'sub.specialPh': 'דאס וואס יעדער באמערקט',
  'sub.cats': 'קלייבט א פאר סטיילס', 'sub.need2': 'שרייבט א נאמען און א שטאט.',
  'sub.s3': 'וואס האט איר גענוצט?', 'sub.s3sub': 'העלפט אנדערע מאכן די זעלבע לוק. נישט קיין מוז.',
  'sub.s3tip': 'קלייבט א בילד, און דריקט גלייך אויף די זאך.', 'sub.tagged': 'געטאגט', 'sub.maxTags': 'דאס איז 8 — מער גייט נישט יעצט.',
  'sub.what': 'וואס איז עס?', 'sub.whatPh': 'לינען טישטעך', 'sub.where': 'וואו האט איר עס געקויפט?', 'sub.wherePh': 'טארגעט',
  'sub.link': 'לינק', 'sub.price': 'פרייז (נישט קיין מוז)', 'sub.note': 'א נאטיץ (נישט קיין מוז)', 'sub.notePh': 'צוויי איינס איבער׳ן צווייטן',
  'sub.category': 'סארט', 'sub.save': 'היט אפ', 'sub.cancel': 'צוריק', 'sub.delete': 'אראפנעמען',
  'sub.s4': 'וועגן אייך', 'sub.s4sub': 'מיר וועלן דאס נאר נוצן אייך צו לאזן וויסן ווען די סוכה גייט ארויף.',
  'sub.yourName': 'נאמען', 'sub.email': 'אימעיל', 'sub.phone': 'טעלעפאן (נישט קיין מוז)',
  'sub.showName': 'ווייזט מיין נאמען', 'sub.useDisplay': 'נוצט אן אנדער נאמען', 'sub.displayPh': 'א משפחה אין לייקוואוד',
  'sub.need4': 'שרייבט אייער נאמען און אן אימעיל.',
  'sub.s5': 'קוקט עס איבער', 'sub.s5sub': 'דאס איז אייער בלאט. גוט אזוי?', 'sub.submit': 'שיקט אריין מיין סוכה',
  'sub.done': 'אייער סוכה איז אריין!', 'sub.doneSub': 'מיר וועלן אייך לאזן וויסן ווען זי גייט ארויף.', 'sub.doneShare': 'זאגט די משפחה',
  'sub.another': 'צוריק צו די גאלערי', 'sub.failed': 'עס איז נישט אריין — טשעקט די אינטערנעט און פרובירט נאכאמאל.',

  'src.eyebrow': 'וואו צו קויפן', 'src.h1': 'געזען?', 'src.h2': 'קויפט עס.',
  'src.sub': 'אלעס וואס מענטשן האבן געטאגט אין זייערע סוכות — ליכט, טישן, ווענט, און די אליינס-געמאכטע טריקס.',
  'src.all': 'אלעס', 'src.seenIn': 'געזען אין', 'src.seenInThese': 'געזען אין די סוכות', 'src.sukkah': 'סוכה', 'src.sukkahs': 'סוכות',

  'win.eyebrow': 'געווינער', 'win.h1': 'די וואס', 'win.h2': 'יעדער האט ליב געהאט.', 'win.picks': 'אונזער אויסוואל', 'win.board': 'ווי עס שטייט יעצט',
  'about.eyebrow': 'וועגן אונז',

  'sub.video': 'לייגט צו א ווידעא', 'sub.optional': 'נישט קיין מוז', 'sub.videoSub': 'א קורצע ווידעא זעט אויס שיין. לייגט ארויף (ביז 50 MB) אדער לייגט אריין א יוטוב / ווימעא לינק.',
  'sub.videoUpload': 'לייגט ארויף א ווידעא', 'sub.or': 'אדער', 'sub.videoLinkPh': 'לייגט אריין א יוטוב אדער ווימעא לינק',
  'sub.videoBig': 'די ווידעא איז מער ווי 50 MB — שניידט עס קורצער, אדער לייגט עס ארויף אויף יוטוב און שיקט דעם לינק.', 'sub.videoBad': 'דאס איז נישט קיין יוטוב, ווימעא אדער ווידעא לינק.',
  'sub.year': 'פון וועלכן יאר איז די סוכה?', 'sub.thisYear': 'היי יאר', 'sub.orEarlier': 'אדער פריער',
  'sub.visitQ': 'קענען מענטשן קומען זען די סוכה?', 'sub.visitYes': 'יא, קומט אריין', 'sub.visitNo': 'ניין, נאר בילדער',
  'sub.visitPublic': 'דאס וועט מען זען אפן אויף אייער סוכה בלאט.', 'sub.address': 'די פולע אדרעס', 'sub.addressPh': '12 Main St, Monsey, NY',
  'sub.times': 'ווען קען מען קומען?', 'sub.timesPh': 'חול המועד, 2–6', 'sub.visitContact': 'קאנטאקט (נישט קיין מוז)', 'sub.visitContactPh': 'טעלעפאן / וואטסעפ',
  'sub.needAddr': 'לייגט אריין די אדרעס — אדער קלייבט „ניין, נאר בילדער“.',
  'detail.year': 'סוכות', 'detail.thisYear': 'היי יאר', 'detail.video': 'ווידעא',
  'visit.open': 'מ׳קען קומען זען', 'visit.when': 'ווען', 'visit.directions': 'וועג', 'visit.whatsapp': 'וואטסעפ דעם בעל הבית',
  'visit.waText': 'שלום! איך האב געזען {title} אויף SukkahPin — קען מען קומען זען?', 'visit.badge': 'מ׳קען קומען', 'visit.filter': 'מ׳קען קומען זען',
  'sub.editing': 'מ׳טוישט', 'sub.saveChanges': 'היט אפ די ענדערונגען', 'sub.saved': 'אפגעהיטן.', 'sub.savedSub': 'אייער סוכה בלאט איז דערהיינטיקט.',
  'sub.savedPending': 'אפגעהיטן — מיר וועלן אייך לאזן וויסן ווען עס גייט ארויף.', 'sub.viewPage': 'זעט מיין סוכה',
  'sub.keepLink': 'אייער פריוואטע לינק צו טוישן', 'sub.keepLinkSub': 'מיט דעם לינק קענט איר פאררעכטן די סוכה ווען איר ווילט. ווער עס האט דעם לינק קען טוישן — שיקט עס צו זיך, נישט אין די גרופע.',
  'sub.sendMe': 'שיקט עס צו מיר אויף וואטסעפ', 'sub.editLinkText': 'מיין SukkahPin לינק צו טוישן {title}:',
  'edit.bad': 'דער לינק ארבעט נישט.', 'edit.badSub': 'אפשר איז ער אלט אדער עס פעלט א שטיקל. בעט אונז פאר א נייעם.', 'detail.edit': 'טוישט מיין סוכה',
  'picks.tag': 'די בעסטע', 'picks.h': 'זעט די שענסטע סוכות פון היי יאר — די ערשטע.',
  'picks.sub': 'מיר וועלן אייך שיקן א פאר אויסגעקליבענע סוכות איבער יום טוב — אויף וואטסעפ אדער אימעיל.',
  'picks.ph': 'טעלעפאן נומער אדער אימעיל', 'picks.cta': 'שיקט מיר', 'picks.fine': 'נאר די סוכות. קיין ספאם, און איר קענט אונז בעטן אויפצוהערן ווען איר ווילט.',
  'picks.bad': 'לייגט אריין א טעלעפאן נומער אדער אן אימעיל.', 'picks.done': 'איר זענט אויף דער ליסטע!', 'picks.doneSub': 'מיר וועלן אייך שיקן די בעסטע סוכות פון היי יאר.',
  'picks.already': 'איר זענט שוין אויף דער ליסטע.', 'picks.later': 'נישט יעצט', 'picks.voteLine': 'ווילט איר אויך באקומען די בעסטע סוכות?',
  'footer.line': 'יעדע סוכה האט א מעשה.', 'footer.admin': 'אדמין', 'footer.sample': 'די סוכות זענען ביישפילן.',
  'search.results': 'רעזולטאטן פאר', 'search.none': 'נאך קיין סוכה נישט געטראפן.',
  'video.title': 'א שפאציר דורך די סוכות פון היי יאר', 'close': 'פארמאכן',
};

const DICTS = { en, yi };
const LANG_KEY = 'sp:lang';

export let lang = (() => { try { return localStorage.getItem(LANG_KEY) === 'yi' ? 'yi' : 'en'; } catch { return 'en'; } })();

export const t = (k) => DICTS[lang][k] ?? en[k] ?? k;
export const tc = (c) => t('cat.' + c) === 'cat.' + c ? c : t('cat.' + c);
export const isRTL = () => lang === 'yi';

export function setLang(l) {
  lang = l;
  try { localStorage.setItem(LANG_KEY, l); } catch {}
  applyLang();
}
export function applyLang() {
  document.documentElement.lang = lang === 'yi' ? 'yi' : 'en';
  document.documentElement.dir = lang === 'yi' ? 'rtl' : 'ltr';
}
