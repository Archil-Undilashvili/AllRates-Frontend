import os
import glob

seo_content = """
    <!-- SEO Meta Tags -->
    <meta name="description" content="ვალუტის კურსები, ვალუტის კონვერტაცია, ლარი დოლარში, ვალუტის კალკულატორი. გაიგეთ რამდენი ლარია 100 დოლარი, ბაზრის კურსები, ეროვნული ბანკის ოფიციალური კურსი, ჯიხურების და ბანკების ვალუტის კურსები. ყველაზე ზუსტი ინფორმაცია Allrates.ge-ზე.">
    <meta name="keywords" content="კურსები, კურსი, ვალუტის კონვერტაცია, ლარი დოლარში, რამდენი ლარია 100 დოლარი, კონვერტაცია, ბაზრის კურსები, დოლარის კურსი, ევროს კურსი, ვალუტის კალკულატორი, ეროვნული ბანკის კურსი, კომერციული ბანკების კურსები, currency exchange georgia, lari to usd, valuta">
    <meta property="og:title" content="ვალუტის კურსები და კონვერტაცია - AllRates.ge">
    <meta property="og:description" content="ვალუტის კურსები, კონვერტაცია, ლარი დოლარში. გაიგეთ უახლესი ბაზრის კურსები და ეროვნული ბანკის მონაცემები რეალურ დროში.">
    <meta property="og:type" content="website">
    
    <!-- Hidden Structural Data for Google (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AllRates.ge",
      "url": "https://allrates.ge",
      "description": "ყველაზე ზუსტი ვალუტის კურსები, ბაზრის კურსები და ვალუტის კონვერტაცია. გაიგეთ რამდენი ლარია 100 დოლარი, ევრო ან ფუნტი. კომერციული ბანკების და სავალუტო ჯიხურების კურსები ერთ სივრცეში.",
      "keywords": "კურსები, კურსი, ვალუტის კონვერტაცია, ლარი დოლარში, რამდენი ლარია 100 დოლარი, კონვერტაცია, ბაზრის კურსები"
    }
    </script>
</head>"""

html_files = glob.glob(os.path.expanduser('~/Desktop/allrates.ge/*.html'))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "<!-- SEO Meta Tags -->" not in content:
        content = content.replace("</head>", seo_content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Already updated {file_path}")

