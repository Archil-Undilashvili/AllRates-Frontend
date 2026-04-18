import re

html_path = '/Users/archilundilashvili/Desktop/AllRates.ge/official.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add media query to style
media_query = """
        @media (max-width: 600px) {
            .search-container {
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }
            .official-table-wrapper {
                overflow-x: auto;
            }
            .official-table th, .official-table td {
                white-space: nowrap;
            }
        }
    </style>"""

html = html.replace('</style>', media_query)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
