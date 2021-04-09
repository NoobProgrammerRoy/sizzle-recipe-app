const ingredients = document.getElementById('ingredients')
const button = document.getElementById('add')

button.addEventListener('click', () => {
    let ingredient = document.createElement('input')
    ingredient.type = 'text', ingredient.name = 'ingredients', ingredient.required = true, ingredient.classList.add('mt-1')
    ingredients.appendChild(ingredient)
})