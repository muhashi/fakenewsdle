# FakeNewsdle
## Guess whether an absurd sounding headline is made up or a real news article!

<img width="2320" height="1186" alt="image" src="https://github.com/user-attachments/assets/e0bd68e8-b08f-4ae7-8d5b-6b58f2560b31" />

[Try the game out here](https://muhashi.com/fakenewsdle/)! 

### Deployment

If you want to host this on your own domain, fork/clone the repo and run `npm install` at the root. In `vite.config.json` change the `base` attribute to whatever directory you will be hosting on. Run `npm run dev` to make sure it compiles correctly, and then committing to your repo. You will need to set GH Pages to deploy via Actions, and allow Actions permissions to read and write. 

### Updating Dataset

`csvToJson.js` script exists for adding new entries to the dataset. Add new lines to `real.csv` and `fake.csv`, and run the script to add new entries to dataset. An equal number of both real and fake headlines will be taken, shuffled, removed from the csv files and added to the JSON dataset.
