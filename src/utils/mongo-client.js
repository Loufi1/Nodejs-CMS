const { MongoClient } = require('mongodb');

const user = 'user';
const pass = 'passwd';
const db_url = 'localhost:27017/cms';

const client = new MongoClient(`mongodb://${user}:${pass}@${db_url}`, { useUnifiedTopology: true });

client.connect()
  .then(() => {
  console.log(`connected to database`);
  })
  .catch((e) => {
  console.error(e);
  });

  /*
    Data Format:

    User {
      username: string
      password: string (Hash)
      roles: string[] ('User' | 'Author' | 'Admin')
      profilePic : string (url, avec valeur par default) (bonus)
    }

    Post {
      title: string
      content: string
      picture: string (url) (bonus)
      slug: string (title mis en minuscule et coller avec des '-')
      createdAt: Date (bonus)
      updatedAt: Date (bonus)
      publishDate: Date
      author: User.username
      type: string ('ARTICLE' | 'PAGE')
      comment: Comment[]
    }

    Comment {
      author: User.username
      content: string
      createdAt: Date (bonus)
      updatedAt: Date (bonus)
    }

  */

module.exports.client = client;