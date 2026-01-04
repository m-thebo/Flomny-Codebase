from workflow.workflow import create_workflow

workflow = create_workflow()

if __name__ == "__main__":

    """
    Example Prompt: Send a email through hotmail. (WONT WORK)
    Example Prompt: When I receive email on Gmail, send message on Discord. (WILL WORK)
    Example Prompt: When I receive email on Gmail, store attachments in Google drive and send message on Discord (Will Work)
    """

    test_prompt = "When I receive email on Gmail, send message on Discord"

    # Pretty separator for start
    print(f"\n{'=' * 50}")
    print(f"Processing Prompt: {test_prompt}")
    print(f"{'=' * 50}\n")

    result = workflow.invoke({"user_prompt": test_prompt})

    if "generated_code" in result:
        print("\n" + "=" * 50)
        print("Generated Integration Codes:\n")

        # Loop through the integration codes and print them with a header
        for intg, code in result["integration_codes"].items():
            print(f"\n{'#' * 10} {intg} Code {'#' * 10}")
            print(f"{code}\n")

        print("=" * 50)
        print("\n################## Merged Code ##################")
        print(f"{result['generated_code']}")
        print("=" * 50)
    else:
        print(f"\n{('=' * 50)}\nError: {result['validation_message']}\n{('=' * 50)}")
