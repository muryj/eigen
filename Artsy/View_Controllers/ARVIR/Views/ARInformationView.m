#import "ARWhitespaceGobbler.h"
#import "ARInformationView.h"
#import "ARAppConstants.h"

#import <FLKAutoLayout/FLKAutoLayout.h>
#import <Artsy+UIFonts/UIFont+ArtsyFonts.h>
#import <ORStackView/ORStackView.h>
#import <UIView+BooleanAnimations/UIView+BooleanAnimations.h>

@implementation InformationalViewState
@end

@interface ARInformationView()
@property (nonatomic, assign) NSInteger index;
@property (nonatomic, strong) NSArray<InformationalViewState *> *states;
@property (nonatomic, weak) ORStackView *stack;
@property (nonatomic, weak) UILabel *xOfYLabel;
@property (nonatomic, strong) NSLayoutConstraint *stackTopConstraint;
@end

@implementation ARInformationView

- (void)setupWithStates:(NSArray<InformationalViewState *> *)states
{
    _states = states;
    _index = -1;

    UILabel *xofYLabel = [self createXOfYLabel];
    self.xOfYLabel = xofYLabel;
    [self addSubview:xofYLabel];
    [xofYLabel alignTop:@"10" leading:@"0" toView:self];
    [xofYLabel alignTrailingEdgeWithView:self predicate:@"0"];

    ORStackView *stack = [[ORStackView alloc] init];
    stack.bottomMarginHeight = 40;

    [self addSubview:stack];
    self.stackTopConstraint = [stack alignTopEdgeWithView:xofYLabel predicate:@"10"];
    [stack alignLeading:@"20" trailing:@"-20" toView:self];
    [stack constrainHeight:@"160"];
    _stack = stack;

    self.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.5];

    [self nextAnimated:NO];
}

- (UILabel *)createXOfYLabel
{
    UILabel *xOfYLabel = [[UILabel alloc] init];
    xOfYLabel.font = [UIFont displayMediumSansSerifFontWithSize:10];
    xOfYLabel.textAlignment = NSTextAlignmentCenter;
    xOfYLabel.textColor = [UIColor whiteColor];
    return xOfYLabel;
}

- (void)next
{
    [self nextAnimated:YES];
}

- (InformationalViewState *)currentState
{
    return self.states[self.index];
}

- (void)nextAnimated:(BOOL)animated
{
    // ignore animated right now
    [self.stack removeAllSubviews];

    // Bump the index and repeat if it's past the top
    self.index++;
    if (self.index > self.states.count) {
        self.index = 0;
    }

    InformationalViewState *state = self.states[self.index];

    self.xOfYLabel.text = state.xOutOfYMessage;

    if (animated) {
        self.stack.alpha = 0;
        self.stackTopConstraint.constant = 30;
    }

    UILabel *messageLabel = [[UILabel alloc] init];
    messageLabel.font = [UIFont serifFontWithSize:16];
    messageLabel.text = state.bodyString;
    messageLabel.textColor = [UIColor whiteColor];
    messageLabel.numberOfLines = 0;
    [self.stack addSubview:messageLabel withTopMargin:@"30" sideMargin:@"0"];

    // Basically a flexible space grabber which forces the state.contenst
    // to align with the bottom instead of from the top
    ARWhitespaceGobbler *gap = [[ARWhitespaceGobbler alloc] init];
    [self.stack addSubview:gap withTopMargin:@"0" sideMargin:@"0"];

    [self.stack addSubview:state.contents withTopMargin:@"0" sideMargin:@"0"];
    if (state.onStart) {
        state.onStart(state.contents);
    }

    if (animated) {
        [self setNeedsLayout];
        [self layoutIfNeeded];

        [UIView animateIf:animated duration:ARAnimationDuration :^{
            self.stack.alpha = 1;
            self.stackTopConstraint.constant = 10;
            [self setNeedsLayout];
            [self layoutIfNeeded];
        }];
    }
}

@end
