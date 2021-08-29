describe('My Vercel Page Test', () => {
  beforeEach(() => {
    cy.viewport(1280, 720); 
    cy.visit('http://localhost:3000');
  });

  it('exist title', () => {
    cy.get('[data-testid=title]').should('exist')
  })

  it('exist card1', () => {
    cy.get('[data-testid=card1]').should('exist')
  })

  it('exist card2', () => {
    cy.get('[data-testid=card2]').should('exist')
  })

  it('exist card3', () => {
    cy.get('[data-testid=card3]').should('exist')
  })

  it('exist card4', () => {
    cy.get('[data-testid=card4]').should('exist')
  })
})


