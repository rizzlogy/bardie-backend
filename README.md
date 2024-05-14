# Bardie

Bardie is a versatile AI chatbot powered by Google's AI, capable of answering questions, generating creative text formats, and assisting with various tasks in a simple and informative way.

## Installation

### 📂 Normal Installation

```sh
npm i bardie
```

### 🔲 Installation For CLI

```sh
npm i bardie -g
```

## Simple Examples

### Example Question to Send Bard API Request

```javascript
const { Bardie } = require("bardie");
const bard = new Bardie();

async function askQuestion() {
  try {
    let result = await bard.question({ ask: "Keep it simple... What is Google Bard?" });
    console.log(result);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

askQuestion();
```

**Response:**

```json
{
  "content": "In a nutshell, I'm Google's AI helper you can chat with. I can answer your questions, generate creative text formats, and help you with various tasks in a simple and informative way. Think of me as a friendly AI companion ready to assist you anytime!",
  "status": 200,
  "creator": "RizzyFuzz"
}
```

### Example Question with Image to Send Bard API Request

```javascript
const { Bardie } = require("bardie");
const bard = new Bardie();

async function askQuestionWithImage() {
  try {
    let result = await bard.question({
      ask: "Keep it simple... What is this image?",
      image: "https://i.imgur.com/OgoPlnf.png"
    });
    console.log(result);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

askQuestionWithImage();
```

**Response:**

```json
{
  "content": "The image you sent me is the logo of Bard, a large language model chatbot developed by Google AI. The logo consists of two colorful stars, one in red and orange and the other in blue and green, on a gray background. The stars are meant to represent creativity and knowledge, while the gray background represents the real world. I hope this helps!",
  "status": 200,
  "creator": "RizzyFuzz"
}
```

## Note

### EN
If there are bugs, please create [Issues](https://github.com/your-repo/issues).

### ID
Jika ada bug, silahkan buat [Issues](https://github.com/your-repo/issues).

## Additional Information

- Bardie also supports TypeScript & ESModule!

## Keywords

- ai
- chatbot
- bot
- robot
- axios
- completions
- cli
- bard
- BardAI
- bard.google.com
- bard.rizzy.eu.org

For more information, check the [documentation](https://github.com/your-repo).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

---

> **Maintainer**: [RizzyFuzz](https://github.com/rizzyfuzz)

Feel free to reach out for support or inquiries. Happy coding with Bardie!
