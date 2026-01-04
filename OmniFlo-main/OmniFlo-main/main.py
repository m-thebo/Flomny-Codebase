from workflow.workflow import create_workflow

workflow = create_workflow()

if __name__ == "__main__":

    """
    Example Prompt: Send an email through hotmail. (WONT WORK)
    Example Prompt: When I receive email on Gmail, send message on Discord. (WILL WORK)
    Example Prompt: When I receive email on Gmail, store attachments in Google drive and send message on Discord (Will Work)
    """

    test_prompt = "When I receive email on Gmail, send message on Discord."

    # Pretty separator for start
    print(f"\n{'=' * 50}")
    print(f"Processing Prompt: {test_prompt}")
    print(f"{'=' * 50}\n")

    result = workflow.invoke({"user_prompt": test_prompt,
                              "integrations": [{
            "name": "Gmail",
            "category": "email",
            "description": "Trigger when a new email is received, or perform actions like sending an email.",
            "documentation": "https://developers.google.com/gmail/api"
        },
        {
            "name": "Google Drive",
            "category": "storage",
            "description": "Upload files, create folders, and manage Google Drive content.",
            "documentation": "https://developers.google.com/drive"
        },
        {
            "name": "Slack",
            "category": "messaging",
            "description": "Send messages to Slack channels or retrieve data from Slack workspaces.",
            "documentation": "https://api.slack.com/"
        },
        {
            "name": "Discord",
            "category": "messaging",
            "description": "Send messages to Discord channels or retrieve data from Discord workspaces.",
            "documentation": "https://api.discord.com/"
        },
        {
            "name": "Twitter",
            "category": "social_media",
            "description": "Post tweets, read tweets, etc.",
            "documentation": "https://twitter.com/docs"
        },
        {
            "name": "Facebook",
            "category": "social_media",
            "description": "Post updates, read data, etc.",
            "documentation": "https://facebook.com/docs"
        }],
                              "documentation_dir": ""})

    # if "generated_code" in result:
    #     print("\n" + "=" * 50)
    #     print("Generated Integration Codes:\n")
    #
    #     # Loop through the integration codes and print them with a header
    #     for intg, code in result["integration_codes"].items():
    #         print(f"\n{'#' * 10} {intg} Code {'#' * 10}")
    #         print(f"{code}\n")
    #
    #     print("=" * 50)
    #     print("\n################## Merged Code ##################")
    #     print(f"{result['generated_code']}")
    #     print("=" * 50)
    # else:
    #     print(f"\n{('=' * 50)}\nError: {result['validation_message']}\n{('=' * 50)}")