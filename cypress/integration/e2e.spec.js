describe('My First Test', () => {
  beforeEach(() => {
    cy.viewport(1280, 720); 
    cy.visit('http://localhost:3000');
  });

  it('Does not do much!', () => {
    expect(true).to.equal(true)
  })
})