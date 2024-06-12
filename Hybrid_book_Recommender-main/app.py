from flask import Flask, request, jsonify

app = Flask(__name__)

book_list = [
    {
        'id': 1,
        'title': 'Clean Code',
        'author': 'Robert C. Martin'
    },
    {
        'id': 2,
        'title': 'The Pragmatic Programmer',
        'author': 'Andrew Hunt and David Thomas'
    },
    {
        'id': 3,
        'title': 'Web Development with Flask',
        'author': 'Miguel Grinberg'
    }
]


@app.route('/books', methods=['GET', 'POST'])
def manage_books():

    if request.method == 'GET':
        if book_list:
            return jsonify(book_list)  # Return all books if list is not empty
        else:
            return jsonify({'message': 'No books found'}), 404  # Clearer message

    elif request.method == 'POST':

        title = request.form['title']
        author = request.form['author']

        # Generate unique ID (consider using a more robust method like UUID)
        new_book_id = len(book_list) + 1
        new_book = {'id': new_book_id, 'title': title, 'author': author}
        book_list.append(new_book)

        return jsonify(new_book), 201  # Created response with the new book

if __name__ == '__main__':
    app.run(host='localhost')
