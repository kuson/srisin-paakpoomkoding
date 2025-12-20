# HTML Snippet Template for TinyMCE

Copy and paste this HTML into the TinyMCE editor (click the "code" button in the toolbar, paste, then click "code" again).

## Download Button + Welcome Message + Links Template

```html
<div style="text-align: center; margin: 20px 0;">
    <div style="margin-bottom: 15px;">
        <a href="assets/Dad_Medicine_Reminder_v2.apk" class="btn btn-success" download style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            <i class="bi bi-android2" style="margin-right: 8px;"></i>Download Medicine_Reminder.apk
        </a>
    </div>
    
    <p style="font-size: 18px; margin: 15px 0; color: #6c757d;">
        Welcome 'ackers! A platform to help teach Paak and Poom coding
    </p>
    
    <div style="margin-bottom: 10px;">
        <a href="https://github.com/kuson/srisin-paakpoomkoding" target="_blank" class="btn btn-dark" style="display: inline-block; padding: 10px 20px; background-color: #212529; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            <i class="bi bi-github" style="margin-right: 8px;"></i>View Code on GitHub
        </a>
    </div>
    
    <div>
        <a href="#videos" class="btn btn-primary" style="display: inline-block; padding: 10px 20px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 25px; font-weight: 500;">
            <i class="bi bi-play-circle" style="margin-right: 8px;"></i>Watch Video First
        </a>
    </div>
</div>
```

## How to Use:

1. In the TinyMCE editor, click the **"code"** button in the toolbar (looks like `<>`)
2. Paste the HTML above
3. Click **"code"** again to return to visual mode
4. Modify the text, links, or file paths as needed

## Customization Tips:

- **Change download link**: Replace `assets/Dad_Medicine_Reminder_v2.apk` with your file path
- **Change GitHub link**: Replace the URL with your repository
- **Change text**: Modify the welcome message or button text
- **Change colors**: 
  - Green button: `background-color: #28a745`
  - Dark button: `background-color: #212529`
  - Blue button: `background-color: #0d6efd`

## Simpler Version (Just Buttons):

```html
<div style="text-align: center; margin: 20px 0;">
    <a href="assets/YourFile.apk" class="btn btn-success" download style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 5px;">
        <i class="bi bi-download"></i> Download File
    </a>
    
    <a href="https://github.com/yourrepo" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 10px 20px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin: 5px;">
        <i class="bi bi-github"></i> View on GitHub
    </a>
</div>
```
