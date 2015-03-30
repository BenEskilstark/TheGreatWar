'use strict';

var GameGroup = function(game, parent) {
    Phaser.Group.call(this, game, parent);

    this.gameBoard = new GameBoard(this.game);
    this.selected = null;
    this.unitGroup = this.game.add.group();

    this.marker = this.game.add.graphics();
    this.marker.lineStyle(2, 0x000000, 1);
    this.marker.drawRect(0, 0, 32, 32); // THIS IS HARDCODE

    this.ui = new UIGroup(this.game);

    this.action = null;
};

GameGroup.prototype = Object.create(Phaser.Group.prototype);
GameGroup.prototype.constructor = GameGroup;

GameGroup.prototype.update = function() {
    // moving the marker
    this.marker.x = this.gameBoard.highlightLayer.getTileX(this.game.input.activePointer.worldX) * 32;
    this.marker.y = this.gameBoard.highlightLayer.getTileY(this.game.input.activePointer.worldY) * 32;

    var currentTile = this.gameBoard.getTile(this.marker.x/32,
					     this.marker.y/32,
					     this.gameBoard.terrainLayer);

    this.ui.setTile(currentTile);

    if (this.game.input.mousePointer.targetObject &&
	this.game.input.mousePointer.targetObject.sprite instanceof Infantry)
	this.ui.setUnit(this.game.input.mousePointer.targetObject.sprite);
    else
	this.ui.setUnit(null);
}

GameGroup.prototype.onClick = function(targetObject) {
    var currentX = this.marker.x/32;
    var currentY = this.marker.y/32;
    if (targetObject === null) {
	// tile
	if (this.selected) {
	    if (this.gameBoard.hasTile(currentX, currentY,
				       this.gameBoard.highlightLayer)) {
		switch (this.action) {
		case 'move':
		    this.selected.moveTo(currentX, currentY);
		    break;
		case 'ranged':
		    break;
		case 'melee':
		    break;
		}
	    }
	    this.ui.hideMenu();
	    this.selected = null;
	    this.action = null;
	    this.gameBoard.unhighlightAll();
	}
    } else {
	if (targetObject.sprite instanceof Infantry) {
	    if (this.gameBoard.hasTile(currentX, currentY,
				       this.gameBoard.highlightLayer)) {
		if ((this.action === 'ranged' || this.action === 'melee') &&
		    targetObject.sprite !== this.selected) {
		    this.selected.attack(targetObject.sprite, this.action);
		    this.selected = null;
		}
	    } else {
		this.selected = targetObject.sprite;
		this.ui.showMenu(this.selected);
	    }
	    if (this.action) {
		this.gameBoard.unhighlightAll();
		this.action = null;
	    }
	} else if (targetObject.sprite instanceof Phaser.Button) {
	    this.action = targetObject.sprite.key.replace('action-', '');
	    this.ui.hideMenu();

	    var highlightType, range;
	    switch (this.action) {
	    case 'move':
		highlightType = 'blue';
		range = this.selected.stats.MOV;
		break;
	    case 'ranged':
		highlightType = 'red';
		range = this.selected.stats.RNG;
		break;
	    case 'melee':
		highlightType = 'red';
		range = this.selected.stats.MEL;
		break;
	    }
	    this.gameBoard.highlightRange(this.selected.x/32, this.selected.y/32,
					  highlightType, range);
	}
    }
}

GameGroup.prototype.addUnit = function(x, y) {
    this.unitGroup.add(new Infantry(this.game, x, y));
}

GameGroup.prototype.resetMenu = function() {

}
