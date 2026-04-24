import markdown
import sys

def convert():
    try:
        with open('Road_Sense_Full_Report.md', 'r', encoding='utf-8') as f:
            text = f.read()
        
        html = markdown.markdown(text, extensions=['extra'])
        
        # Add basic CSS to make it look like a nice report/PDF
        full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Road Sense Technical Report</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0 auto;
            max-width: 800px;
            padding: 40px;
            color: #333;
        }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }}
        h2 {{ color: #34495e; margin-top: 30px; }}
        h3 {{ color: #16a085; }}
        p, li {{ font-size: 11pt; }}
        ul {{ margin-bottom: 20px; }}
        hr {{ border: 0; height: 1px; background: #ddd; margin: 30px 0; }}
        @media print {{
            body {{ padding: 0; max-width: 100%; }}
            .page-break {{ page-break-before: always; }}
        }}
    </style>
</head>
<body>
    {html.replace('<div style="page-break-after: always;"></div>', '<div class="page-break"></div>')}
</body>
</html>"""

        with open('Road_Sense_Full_Report.html', 'w', encoding='utf-8') as f:
            f.write(full_html)
        print("Successfully generated HTML!")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    convert()
