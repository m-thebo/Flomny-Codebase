### Setup Instructions for Flomny

Follow these steps to set up the project and run it on your local machine:

---

#### 1. **Clone the Repository**
First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/multiagentai/Flomny.git
```

This will create a local copy of the repository.

---

#### 2. **Create a Virtual Environment**
Next, create a virtual environment in the project directory. This will help manage dependencies locally.

```bash
python -m venv .venv
```

This command will create a `.venv` folder in the current directory containing the virtual environment.

---

#### 3. **Activate the Virtual Environment**
Activate the virtual environment. The method varies depending on your operating system.

- **Windows:**
  ```bash
  .\.venv\Scripts\activate
  ```

- **Linux/macOS:**
  ```bash
  source ./.venv/bin/activate
  ```

Once activated, your terminal prompt will change to indicate that the virtual environment is active.

---

#### 4. **Install Dependencies**
Install the required Python dependencies listed in the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

This will install all necessary packages for the project.

---

#### 5. **Configure API Keys**
Rename `config.sample.json` to `config.json`:

```bash
mv config.sample.json config.json
```

Open the `config.json` file and add the necessary API keys and configuration details. Ensure that all required APIs are properly configured in this file.

---

#### 6. **Run the Application**
To run the main application, execute the following:

```bash
python main.py
```

This will start the execution of the project with the current configuration.

---

#### 7. **Change the Test Prompt (Optional)**
To experiment with different inputs, change the `test_prompt` variable in `main.py`. For example:

```python
test_prompt = "When I receive an email on Gmail, send a message on Discord"
```

This will modify the prompt used during the execution of the workflow.

---

