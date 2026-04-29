import os
import glob
import re

new_seo_content = """<!-- SEO Meta Tags -->
    <meta name="description" content="ვალუტის კურსები, ვალუტის კონვერტაცია, ლარი დოლარში, ვალუტის კალკულატორი. გაიგეთ რა ღირს დოლარი დღეს, ბაზრის კურსები, ეროვნული ბანკის (NBG) ოფიციალური კურსი, ბანკების, მიკროსაფინანსოების და ჯიხურების კურსები. ისტორიული კურსები, ექსპორტი ექსელში, ფორექსი, კრიპტოვალუტების, ოქროს, ნავთობის და აქციების ფასები. Allrates.ge">
    <meta name="keywords" content="კურსები, კურსი, ვალუტის კონვერტაცია, ლარი დოლარში, რამდენი ლარია 100 დოლარი, კონვერტაცია, ბაზრის კურსები, დოლარის კურსი, ევროს კურსი, ვალუტის კალკულატორი, ეროვნული ბანკის კურსი, ეროვნული ბანკის კურსები, ოფიციალური კურსი, ოფიციალური კურსები, NBG rate, NBG rates, კურსების ექსპორტი ექსელში, კურსის ექსპორტი, ექსპორტი xls, ექსპორტი xlsx, ისტორიული კურსები, მიკროსაფინანსო ორგანიზაციების კურსები, ბანკების კურსები, სავალუტო ჯიხურების კურსები, რა ღირს დოლარი დღეს, რა ღირს დოლარი ახლა, ფორექს კურსები, forex rates, forex კურსები, ევრო-დოლარის კურსი, ევრო დოლარის კურსი ახლა, კრიპტოვალუტის ფასები, კრიპტოვალუტის კურსები, ბიტკოინის ფასი, ნავთობის ფასი, ოქროს ფასი, ვერცხლის ფასი, ტესლას ფასი, ეფლის ფასი, ვალუტის კურსი, valuta, valutis kursebi, lari to usd, currency exchange georgia, komerciuli bankebis kursebi, jixurebis kursebi, allrates, allrates.ge">
    <meta property="og:title" content="ვალუტის კურსები და კონვერტაცია - AllRates.ge">
    <meta property="og:description" content="ყველა ვალუტის კურსი ერთ სივრცეში: ეროვნული ბანკი, კომერციული ბანკები, ჯიხურები. კრიპტოვალუტები, აქციები და კალკულატორი.">
    <meta property="og:type" content="website">
    
    <!-- Hidden Structural Data for Google (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AllRates.ge",
      "url": "https://allrates.ge",
      "description": "ყველაზე ზუსტი ვალუტის კურსები, ბაზრის კურსები და ვალუტის კონვერტაცია. ეროვნული ბანკის (NBG), მიკროსაფინანსოების, ბანკების და ჯიხურების კურსები. კრიპტოვალუტები და აქციები.",
      "keywords": "კურსები, ეროვნული ბანკის კურსი, ოფიციალური კურსები, ბაზრის კურსები, ვალუტის კონვერტაცია, ვალუტა"
    }
    </script>
</head>"""

html_files = glob.glob(os.path.expanduser('~/Desktop/allrates.ge/*.html'))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = re.compile(r'<!-- SEO Meta Tags -->.*?</head>', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(new_seo_content, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated SEO tags in {file_path}")
    else:
        print(f"SEO block not found in {file_path}")

