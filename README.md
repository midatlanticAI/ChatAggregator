# Chat Aggregator

A powerful chat interface that allows simultaneous interaction with multiple AI models (OpenAI, Anthropic, and Google's Gemini) in a collaborative environment.

## Features

* 🤖 **Multi-model Support**: OpenAI, Anthropic Claude, and Google Gemini
* 🔄 **Collaborative Responses**: Models can interact with and reference each other
* 💬 **Individual or Combined Chats**: Use models separately or all at once
* 🎨 **Clean, Modern UI**: Built with Next.js and Tailwind CSS
* 🔒 **Secure**: API keys managed server-side
* ⚡ **Real-time Updates**: Immediate response streaming
* 🧩 **Modular Design**: Easy to extend and customize

## Getting Started

### Prerequisites

* Node.js 18+ installed
* NPM or Yarn package manager
* API keys from:
  * OpenAI (GPT-4)
  * Anthropic (Claude)
  * Google AI Studio (Gemini)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/midatlanticAI/ChatAggregator.git
   cd ChatAggregator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a .env file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   GOOGLE_API_KEY=your_google_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

Open http://localhost:3000 in your browser

## Project Structure

```
ChatAggregator/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/         # API routes for each model
│   │   └── page.tsx     # Main chat interface
│   ├── components/      # React components
│   │   ├── chat/       # Chat-specific components
│   │   └── ui/         # Shared UI components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   └── services/       # API service layers
├── public/             # Static assets
└── styles/            # Global styles
```

## Key Components

### Chat Interface
* ChatContainer: Main chat interface component
* ChatHeader: Model selection and controls
* MessageList: Displays chat messages
* ChatInput: Message input with send functionality

### Model Integration
* Individual API routes for each model
* Proper error handling and rate limiting
* Message history management
* Collaborative response formatting

## Configuration

### Environment Variables
```env
OPENAI_API_KEY=       # Required for OpenAI integration
ANTHROPIC_API_KEY=    # Required for Anthropic integration
GOOGLE_API_KEY=       # Required for Gemini integration
```

### Model Settings
* OpenAI: GPT-4 Turbo
* Anthropic: Claude 3.5 Sonnet
* Gemini: Gemini Pro

## Usage

### Single Model Chat
1. Select a model (OpenAI, Anthropic, or Gemini)
2. Type your message
3. Press Enter or click Send

### Multi-Model Chat
1. Select "All Models"
2. Type your message
3. Each model will respond in sequence
4. Models can reference and interact with each other's responses

### Chat Management
* Clear Chat: Clears current chat history
* New Chat: Starts a fresh conversation
* Chat History: Automatically saved locally

## Development

### Running Tests
```bash
npm run test
# or
yarn test
```

### Building for Production
```bash
npm run build
# or
yarn build
```

### Code Style
* Uses ESLint and Prettier
* TypeScript strict mode enabled
* Follows Next.js best practices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* Built with Next.js
* UI components from shadcn/ui
* Styling with Tailwind CSS
* Icons from Lucide

## Support

For support, please open an issue in the GitHub repository.

## Roadmap

- [ ] Add streaming responses
- [ ] Implement message search
- [ ] Add file upload support
- [ ] Enhance collaborative responses
- [ ] Add user authentication
- [ ] Implement cloud storage